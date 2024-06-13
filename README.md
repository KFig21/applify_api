# applify_api
 Applify API to power the backend for the  [Applify Client](https://github.com/KFig21/applify_client)

## Description

Applify is built with the MERN stack, React sticky-tables, Styled-components, and JWT authentication. The goal of this project is to help simplify and streamline the job search process by allowing users to track their applications and store their credentials in easily accessible quick-links.

## Installation

### Clone the repo

```git clone https://github.com/KFig21/applify_api.git```

1) Change .env.example to .env
2) Add the collections: boards, jobs, users to your MongoDB database
3) Input your MongoDB Atlas or MongoDB credentials
4) Enter a unique secret key
5) Change port if necessary. **Do Note** 3000 is used by the applify_client

### Install & Run

```npm i && npm run start```