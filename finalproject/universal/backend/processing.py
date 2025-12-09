import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from PIL import Image
import requests
from io import BytesIO
import time, unicodedata


from letterboxdpy.user import User

instance = 'fi011235' # test instance 


# this should now work and output a dataframe... hopefully....
def return_diary(username):
    user_instance = User(username)
    diary = user_instance.get_diary()
    df = pd.DataFrame(diary)
    entries_df = pd.json_normalize(df["entries"])
    return(entries_df)


# runs k means and get full clean df with color groupings
def run_k_means(diary, api_key):
    diary_new = diary.copy()
  # Adding new columns that I will populate as I go through each movie and find info from each movie's API/metadata
    diary_new["Genre"] = None
    diary_new["Language"]=None
    diary_new["Runtime"]=None
    diary_new["Color Palette"]=None
    diary_new["Palette Cluster"]=None
    diary_new["PCA1"]=None
    diary_new["PCA2"]=None
    diary_new["GenreNames"]=None
    diary_new["LanguageName"]=None

    # genre/language mappings access - define these
    genre_map = {g["id"]: g["name"] for g in requests.get(
    f"https://api.themoviedb.org/3/genre/movie/list?api_key={api_key}"
    ).json()["genres"]}


    langs_resp = requests.get(
    f"https://api.themoviedb.org/3/configuration/languages?api_key={api_key}"
    ).json()
    lang_map = {l["iso_639_1"]: l["english_name"] for l in langs_resp}


    def clean_title(t):
        return unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode()
    


    for index, row in diary_new.iterrows():
       title = clean_title(row['name'])
       year = int(row.iloc[9]) if not pd.isna(row.iloc[9]) else None 

       params = {
        "api_key": api_key,
        "query": title,
        "include_adult": True
        }
        
       if year:  # below, making sure to take year into account when finding in database
            params["year"] = year
       
       resp = requests.get("https://api.themoviedb.org/3/search/movie", params=params).json()

       # try looking for tv show results too if still isn't showing up
       if not resp["results"]:
          resp = requests.get("https://api.themoviedb.org/3/search/tv", params=params).json()
    
       if resp["results"]:
        movie_id = resp["results"][0]["id"]
        details = requests.get(
            f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={api_key}"
        ).json()
        result = resp["results"][0]
        title_found = result.get("title") or result.get("name")
        poster_path = result.get("poster_path")
 

        # also, I want to store some other info for stats. info is: genre, runtime, original language
        diary_new.at[index, "Genre"] = [g["id"] for g in details.get("genres", [])] # here, just stored as an ID -> before analysis, will have to translate ID to actual genre (get from TMDB)
        diary_new.at[index, "Runtime"] = details.get("runtime")
        diary_new.at[index, "Language"] = details.get("original_language")# same here, just an abbreviated version of language 


       if poster_path:
          url = f"https://image.tmdb.org/t/p/w500{poster_path}"
          response = requests.get(url)
          img = Image.open(BytesIO(response.content)) # just loading img in from url
          palette = img.convert("P", palette=Image.ADAPTIVE, colors=3)
          palette_colors = palette.getpalette()[:3*3]  # top 3 RGB vals!

          diary_new.at[index, "Color Palette"] = palette_colors 
          time.sleep(0.25)  # to respect rate limits

        

    df_colors = diary_new.dropna(subset=["Color Palette"]).copy()
    X = np.vstack(df_colors["Color Palette"].values)
    k = 7   # adjust based on how many clusters you want
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    df_colors["Palette Cluster"] = kmeans.fit_predict(X)


    cluster_centers = kmeans.cluster_centers_.reshape(k, 3, 3).astype(int)

    pca = PCA(n_components=2, random_state=42)
    X_2D = pca.fit_transform(X)

    df_colors["PCA1"] = X_2D[:, 0]
    df_colors["PCA2"] = X_2D[:, 1] 

    # now create new colns with full genre (rather than just ID), non-abbreviated language
    df_colors["GenreNames"] = df_colors["Genre"].apply(
    lambda ids: [genre_map.get(i, "Unknown") for i in ids] if isinstance(ids, list) else []
    )
    df_colors["LanguageName"] = df_colors["Language"].map(lang_map)


    df_cleaner = df_colors.drop(columns=['slug', 'release', 'actions.rewatched', 'date.year', 'date.day', 'page.no', 'Genre', 'Language', 'actions.liked'])
# removing slug because letterboxd specific and don't need, removing date.year and date.day because only calculating monthly ave, removing page.no because not needed, removing actions.rewatched and actions.liked because not needed for now
    return(df_cleaner)

def summary_stats(diary):
    summary = {}
    summary['Average Rating']= diary['actions.rating'].dropna().astype(float).mean()/2 # just the mean of all entries, divide by 2 because of scale (1-10 vs 0.5-5)
    summary['Total Movies'] = len(diary)
    
    genre_counts = (
    diary["GenreNames"]
    .explode()  # turns each list element into its own row
    .dropna()
    .value_counts() #  NOW do value counts
    )

    summary['Top 5 Genres'] = genre_counts.head(5).index.tolist()
    summary['Unique Languages'] = diary['LanguageName'].nunique()

    # getting monthly ave
    monthly= diary['date.month'].value_counts().sort_index()
   # summary['month breakdown']= monthly.to_dict() # NOTE: comment this out when i'm sure the ave is working 
    summary['Monthly Averages'] = monthly.mean()

    summary["Total Runtime (hrs)"] = diary['Runtime'].dropna().astype(float).sum()/60 # in hrs so it sounds less embarrassing 

    return summary


# Testing code - commented out for now
#dff= return_diary(instance)
#diary2= (run_k_means(dff,'f00b535c6cd0d85ad4ee31a06a4e8554')) # hooray! it's working 
# #print(diary2.head())
# unique = diary2['LanguageName'].unique()
# print(diary2.iloc[92])
#print(summary_stats(diary2))

def convert_to_serializable(obj):
    """Convert numpy/pandas types to Python native types for JSON serialization"""
    if isinstance(obj, dict):
        return {k: convert_to_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_serializable(item) for item in obj]
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif pd.isna(obj):
        return None
    elif isinstance(obj, (np.integer, np.floating)):
        return obj.item()
    elif isinstance(obj, (np.bool_)):
        return bool(obj)
    else:
        return obj

def full_bundle(username, api_key):
    diary = return_diary(username)
    full_diary = run_k_means(diary, api_key)
    summary = summary_stats(full_diary)
    
    # Convert DataFrame to dict and replace NaN with None
    diary_dict = full_diary.where(pd.notna(full_diary), None).to_dict(orient='records')
    
    # Serialize everything properly for JSON
    result = {
        "diary": convert_to_serializable(diary_dict),
        "summary": convert_to_serializable(summary)
    }
    
    return result