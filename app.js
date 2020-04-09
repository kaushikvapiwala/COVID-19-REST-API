"use strict";

const express = require("express");
const mysql = require("mysql");
const app = express();

const apiTimeout = 3 * 1000;
app.use((req, res, next) => {
  // Set the timeout for all HTTP requests
  req.setTimeout(apiTimeout, () => {
    let err = new Error("Request Timeout");
    err.status = 408;
    next(err);
  });
  // Set the server response timeout for all HTTP requests
  res.setTimeout(apiTimeout, () => {
    let err = new Error();
    err.status = 503;
    next(`{"error" : "Request Timeout. Check endpoint."}`);
  });
  next();
});

const con = mysql.createConnection({
  host: "db_link",
  port: 0000,
  user: "username",
  password: "password",
  database: "db_name",
  multipleStatements: true,
});

let lastDate = "";
con.connect(function (err) {
  if (err) return err;
  const queryColumn = `SELECT column_name
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'table_timeseries_death'`;

  con.query(queryColumn, function (err, result) {
    if (err) return err;

    let lastElement = result[result.length - 1].column_name;

    lastDate = lastElement;
  });
});

app.get("/data/:status/country/:country/date/:date", (req, res) => {
  const statusRequired = req.params.status.toLowerCase();
  var countryRequired = req.params.country.toLowerCase().split(/_/g).join(" ");
  if (countryRequired.includes("&"))
    countryRequired = countryRequired.split("&");
  else countryRequired = [countryRequired];
  console.log(countryRequired);
  var dateRequired = req.params.date.split(/-/g).join("/");

  if (dateRequired.includes("&")) dateRequired = dateRequired.split("&");
  else dateRequired = [dateRequired];

  console.log(dateRequired);

  var queryRequired = "";
  for (var c in countryRequired) {
    for (var d in dateRequired) {
      queryRequired += `SELECT country,'${
        dateRequired[d]
      }'  as \`date\` , sum(table_timeseries_${statusRequired}.\`${
        dateRequired[d]
      }\`) as ${statusRequired}  FROM table_timeseries_${statusRequired} where country = '${countryRequired[
        c
      ].toLowerCase()}' group by country;`;
      console.log(queryRequired);
    }
  }

  console.log(queryRequired);

  con.query(queryRequired, function (err, result) {
    if (err) {
      return res.status(400).send({ code: err["code"] });
    }

    if (result.length == 0) {
      const output = {
        error: "Invalid Call. Check Endpoint!",
      };
      return res.status(400).json(output);
    }
    if (result) {
      if (result.length > 1)
        for (var i = 0; i < result.length; i++) {
          result[i] = result[i][0];
        }

      return res.status(200).json(result);
    }
  });
});

app.get("/data/:status/country/:country/province/:province", (req, res) => {
  const statusRequired = req.params.status.toLowerCase();
  const countryRequired = req.params.country
    .toLowerCase()
    .split(/_/g)
    .join(" ");

  const provinceRequired = req.params.province
    .toLowerCase()
    .split(/_/g)
    .join(" ");

  const requestedDate = lastDate;
  const queryRequired = `SELECT country, province, table_timeseries_${statusRequired}.\`${requestedDate}\` as ${statusRequired}  FROM table_timeseries_${statusRequired} where country = '${countryRequired}' and province = '${provinceRequired}'`;

  console.log(queryRequired);

  con.query(queryRequired, function (err, result) {
    if (err) {
      return res.status(400).send({ code: err["code"] });
    }

    if (result.length == 0) {
      const output = {
        error: "Invalid Call. Check Endpoint!",
      };

      return res.status(400).json(output);
    }
    if (result) {
      return res.status(200).json(result);
    }
  });
});

app.get(
  "/data/:status/country/:country/province/:province/date/:date",
  (req, res) => {
    const statusRequired = req.params.status.toLowerCase();
    const countryRequired = req.params.country
      .toLowerCase()
      .split(/_/g)
      .join(" ");
    const requestedDate = req.params.date.split(/-/g).join("/");
    const provinceRequired = req.params.province
      .toLowerCase()
      .split(/_/g)
      .join(" ");
    const queryRequired = `SELECT country, province, '${requestedDate}'  as \`date\`, table_timeseries_${statusRequired}.\`${requestedDate}\` as ${statusRequired}  FROM table_timeseries_${statusRequired} where country = '${countryRequired}' and province = '${provinceRequired}'`;

    con.query(queryRequired, function (err, result) {
      if (err) {
        return res.status(400).send({ code: err["code"] });
      }

      if (result.length == 0) {
        const output = {
          error: "Invalid Call. Check Endpoint!",
        };

        return res.status(400).json(output);
      }

      if (result) {
        return res.status(200).send(result);
      }
    });
  }
);

app.get("/data/:status/province/date/:date", (req, res) => {
  const statusRequired = req.params.status.toLowerCase();
  const requestedDate = req.params.date.split(/-/g).join("/");
  const queryRequired = `SELECT province, country, table_timeseries_${statusRequired}.\`${requestedDate}\` as ${statusRequired}   FROM table_timeseries_${statusRequired} `;
  console.log(queryRequired);

  con.query(queryRequired, function (err, result) {
    if (err) {
      return res.status(400).send({ code: err["code"] });
    }
    if (result.length == 0) {
      const output = {
        error: "Invalid Call. Check Endpoint!",
      };

      return res.status(400).json(output);
    }

    if (result) {
      return res.status(200).send(result);
    }
  });
});

app.get("/data/:status/date/:date", (req, res) => {
  const statusRequired = req.params.status.toLowerCase();
  const requestedDate = req.params.date.split(/-/g).join("/");
  const queryRequired = `SELECT country, sum(table_timeseries_${statusRequired}.\`${requestedDate}\`) as ${statusRequired}   FROM table_timeseries_${statusRequired} group by country`;

  con.query(queryRequired, function (err, result) {
    if (err) {
      return res.status(400).send({ code: err["code"] });
    }
    if (result.length == 0) {
      const output = {
        error: "Invalid Call. Check Endpoint!",
      };

      return res.status(400).json(output);
    }

    if (result) {
      return res.status(200).send(result);
    }
  });
});

app.get("/data/:status/country/:country", (req, res) => {
  const statusRequired = req.params.status.toLowerCase();
  const requestedDate = lastDate;
  const countryRequired = req.params.country
    .toLowerCase()
    .split(/_/g)
    .join(" ")
    .split("&");
  let finalResponse = [];
  if (req.params.country.includes("&")) {
    for (let i = 0; i < countryRequired.length; i++) {
      finalResponse += `SELECT country, '${requestedDate}'  as \`date\`, sum(table_timeseries_${statusRequired}.\`${requestedDate}\`) as ${statusRequired}  FROM table_timeseries_${statusRequired} where country = '${countryRequired[
        i
      ]
        .toLowerCase()
        .split(/_/g)
        .join(" ")}' group by country;`;
    }
  } else {
    finalResponse += `SELECT country, '${requestedDate}'  as \`date\`, sum(table_timeseries_${statusRequired}.\`${requestedDate}\`) as ${statusRequired}  FROM table_timeseries_${statusRequired} where country = '${countryRequired}' group by country;`;
  }
  console.log(finalResponse);
  con.query(finalResponse, function (err, result) {
    if (err) {
      return res.status(400).send({ code: err["code"] });
    }
    if (result.length == 0) {
      const output = {
        error: "Invalid Country.",
      };

      return res.status(400).json(output);
    }

    if (result) {
      if (result.length > 1)
        for (var i = 0; i < result.length; i++) {
          result[i] = result[i][0];
        }

      return res.status(200).json(result);
    }
  });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});

module.exports = app;
