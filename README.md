# COVID-19-REST-API

The project can be hosted on any cloud platform by replacing 'database' related information in the data-pipeline and app.js configurations.
It is necessary to trigger to execute the data-pipeline everyday to store updated data in the database on the cloud. 

<h2>Endpoints</h2>

<h3>Usage Reference:</h3>

<b>status:</b> 'confirmed', 'death', 'recovered'

<b>country:</b> As per the names given in the original dataset at GitHub. Replace every space with '_'. In the case of Multiple countries, use '&' as a delimiter. Refer exact country names in the links given at the end of the article.

<b>date:</b> Date format. MM-DD-YYYY. In the case of Multiple Dates, use '&' as a delimiter.

<ol>
<li><b>Get by Country and Date (Multiple Countries and Dates allowed)</b>

```
https://capable-hangout-272301.appspot.com/data/{status}/country/{country}/date/{date}

Example Usage:
https://capable-hangout-272301.appspot.com/data/confirmed/country/india&us&canada/date/04-02-2020&04-03-2020&04-05-2020
```
</li>
<br>
<li><b>Get Latest Data by Country and Province </b> 
<br>

    https://capable-hangout-272301.appspot.com/data/{status}/country/{country}/province/{province}

    Example usage:
    https://capable-hangout-272301.appspot.com/data/confirmed/country/canada/province/british_columbia


</li>
<br>

<li><b>Get by Country, Province and Date</b>

    https://capable-hangout-272301.appspot.com/data/{status}/country/{country}/province/{province}/date/{date}

    Example usage:
    https://capable-hangout-272301.appspot.com/data/confirmed/country/canada/province/british_columbia/date/04-01-2020

</li>
<br>
<li>
<b>Get All Data by Date</b>

    https://capable-hangout-272301.appspot.com/data/{status}/province/date/{date}

    Example usage:

    https://capable-hangout-272301.appspot.com/data/death/province/date/04-01-2020


</li>

<br>

<li>
<b> Get All Data grouped by countries and Date</b>
    
    https://capable-hangout-272301.appspot.com/data/{status}/date/{date}

    Example usage:

    https://capable-hangout-272301.appspot.com/data/recovered/date/04-02-2020
</li>

<br>
<li>
<b>Get All data by Country (Multiple countries allowed)</b>

    https://capable-hangout-272301.appspot.com/data/{status}/country/{country}

    Example usage:

    https://capable-hangout-272301.appspot.com/data/death/country/united_kingdom
</li>

</ol>

API is also hosted on RapidAPI Marketplace with detailed examples and instructions.

https://rapidapi.com/kaushikvapiwala/api/covid1910

<h3>Dataset Reference:</h3>
Confirmed Cases: 

    https://github.com/CSSEGISandData/COVID-19/blob/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv

Recovered Cases: 

    https://github.com/CSSEGISandData/COVID-19/blob/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv

Death Cases: 

    https://github.com/CSSEGISandData/COVID-19/blob/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv

Feedback Appreciated. Stay Safe
