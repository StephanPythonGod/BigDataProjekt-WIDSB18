CREATE DATABASE WheaterData;
CREATE TABLE average (
_ID integer NOT NULL Primary key,
longitude float,
latitude float,
count float
);
Insert INTO average (_ID, longitude, latitude, count) VALUES (10000, 24.6408, 46.7728, 3);
Insert INTO average (_ID, longitude, latitude, count) VALUES (10001, 40.7296231, -73.9937796, 2);
Insert INTO average (_ID, longitude, latitude, count) VALUES (10002, 52.9263756, 8.0194493, 1.5)