import psycopg2
from io import StringIO
import pandas as pd
import pymysql
from sqlalchemy import create_engine
import numpy as np



engine = create_engine(
    'mysql+pymysql://username:password@db_link:db_port/db_name',
    echo=True)

connection = pymysql.connect(host='db_link', user='username', password='password', db='db_name')
cursor = connection.cursor()

def timeseries():
    #Fetch Data from JHU
    url_timeseries_confirmed = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"
    url_timeseries_death = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"
    url_timeseries_recovered = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv"

    dataset_timeseries_confirmed = pd.DataFrame()
    dataset_timeseries_death = pd.DataFrame()
    dataset_timeseries_recovered = pd.DataFrame()
    
    #Store data from GitHub Link to the DataFrame.
    dataset_timeseries_confirmed = pd.read_csv(url_timeseries_confirmed)
    dataset_timeseries_death = pd.read_csv(url_timeseries_death)
    dataset_timeseries_recovered = pd.read_csv(url_timeseries_recovered)

    #Rename Column names
    dataset_timeseries_confirmed = dataset_timeseries_confirmed.rename(
        columns={'Province/State': 'province', 'Country/Region': 'country'})
    dataset_timeseries_death = dataset_timeseries_death.rename(
        columns={'Province/State': 'province', 'Country/Region': 'country'})
    dataset_timeseries_recovered = dataset_timeseries_recovered.rename(
        columns={'Province/State': 'province', 'Country/Region': 'country'})

    dataframe_col = list(dataset_timeseries_recovered)

    #Change date column to MM-DD-YYYY format
    for i in range(4,len(dataframe_col)):
        current = dataframe_col[i]
        current_list = current.split('/')
        current_list[0] = "0" + current_list[0] if len(current_list[0]) < 2 else current_list[0]
        current_list[1] = "0" + current_list[1] if len(current_list[1]) < 2 else current_list[1]
        current_list[2] = "20" + current_list[2]

        dataframe_col[i] = '/'.join(current_list)

    dataset_timeseries_recovered.columns = dataframe_col
    dataset_timeseries_death.columns = dataframe_col
    dataset_timeseries_confirmed.columns = dataframe_col

    #Lower case country name
    dataset_timeseries_death['country'] = dataset_timeseries_death['country'].str.lower()
    dataset_timeseries_death['province'] = dataset_timeseries_death['province'].str.lower()
    dataset_timeseries_confirmed['country'] = dataset_timeseries_confirmed['country'].str.lower()
    dataset_timeseries_confirmed['province'] = dataset_timeseries_confirmed['province'].str.lower()
    dataset_timeseries_recovered['country'] = dataset_timeseries_recovered['country'].str.lower()
    dataset_timeseries_recovered['province'] = dataset_timeseries_recovered['province'].str.lower()

    #Smartly infer column datatype
    dataset_timeseries_recovered = dataset_timeseries_recovered.infer_objects()
    dataset_timeseries_confirmed = dataset_timeseries_confirmed.infer_objects()
    dataset_timeseries_death = dataset_timeseries_death.infer_objects()

    #Replace nan with 0
    dataset_timeseries_recovered.at[:,4:] = dataset_timeseries_recovered.iloc[:,4:].replace(np.nan,int(0))
    dataset_timeseries_confirmed.at[:, 4:] = dataset_timeseries_confirmed.iloc[:, 4:].replace(np.nan, int(0))
    dataset_timeseries_death.at[:, 4:] = dataset_timeseries_death.iloc[:, 4:].replace(np.nan, int(0))

    #Smartly infer column datatype
    dataset_timeseries_recovered = dataset_timeseries_recovered.infer_objects()
    dataset_timeseries_confirmed = dataset_timeseries_confirmed.infer_objects()
    dataset_timeseries_death = dataset_timeseries_death.infer_objects()

    #Drop Table and add new table (This is only feasible as appending specific column may lead to more complications and the current data is not so big)
    cursor.execute('DROP TABLE IF EXISTS table_timeseries_confirmed')
    cursor.execute('DROP TABLE IF EXISTS table_timeseries_death')
    cursor.execute('DROP TABLE IF EXISTS table_timeseries_recovered')

    #Create SQL queries from dataframe and add it to the database on the cloud
    dataset_timeseries_confirmed.to_sql('table_timeseries_confirmed', con=engine, if_exists='replace',chunksize=1000)
    dataset_timeseries_death.to_sql('table_timeseries_death', con=engine, if_exists='replace',chunksize=1000)
    dataset_timeseries_recovered.to_sql('table_timeseries_recovered', con=engine, if_exists='replace',chunksize=1000)

    #Add index on country to query speed. (Useful for API)
    cursor.execute('ALTER TABLE `table_timeseries_confirmed` ADD INDEX `table_timeseries_c_idx_country` (`country`(50));')
    cursor.execute('ALTER TABLE `table_timeseries_death` ADD INDEX `table_timeseries_d_idx_country` (`country`(50));')
