# Lottery

You can test this app at [seek4k.com.br/lotomania](https://seek4k.com.br/lotomania)

## The motivation...

This application was created to automate a report that used to be manually built by my father.

He likes to play the lottery and created some “strategies” to plan the next game based on historical results.

To make things easier and practice some programming skills, I created this app...

## Decisions and choices...

It was developed in Nodejs as Javascript is my main language and is a good tool to solve this kind of problem.

I decided to include a remote Postgres DB for practicing and to create a history of the results (just in case we need to get some statistics in future).

Also, I use an API that serves the results.

As access to the app will not be intensive, I decided to keep all access and sync with the database inside the route access. If it was not the case, I would put separate processes to run on a time basis (using Cron/PM2 on a server).

Challenge...

The greatest challenge was to generate the PDF with some format changes (excluding the download "button" from print)... It took me some time to study and become familiar with Puppeteer.

I choose this package as it is very comprehensive and I could figure out other uses in the future (ex web scrap).

## Notes...

No focus was dedicated to the design, maybe on a future version.

I learned a lot and had a lot of fun doing this!

Now, thinking about the next project...
