<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">Songchart</h3>

  <p align="center">
    cloud-based choir repertoire (no more paper records).
    <br />
    <a href="https://github.com/teddycitrus/songchart"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://sacmchoir.vercel.app">View Live</a>
    &middot;
    <a href="https://github.com/teddycitrus/songchart/issues/new?labels=bug">Report Bug</a>
    &middot;
    <a href="https://github.com/teddycitrus/songchart/issues/new?labels=enhancement">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

Songchart is a web app built for the youth choir at Saint Alphonsa Cathedral Mississauga. It gives every member instant access to the full repertoire (song metadata, BPM, key, capo, and inline chord sheets or lyrics rendered directly in the browser) from any device.

Key capabilities:
**Song database**
- title, key, BPM, capo, and transposition stored in MongoDB, browsable from any phone, tablet, or desktop
**Inline document viewer**
- chord sheets and lyrics are stored as `.docx` files in Backblaze B2 object storage and rendered in-browser via `mammoth`, with no download required
**Weighted setlist generator**
- builds randomised rehearsal and performance setlists, with configurable song weights so frequently-needed songs appear more often
**Protected write access**
- JWT-based authentication gates song creation and deletion, keeping the database clean

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

| layer | tools |
|---|---|
| frontend | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) |
| backend | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white) ![Backblaze B2](https://img.shields.io/badge/Backblaze_B2-E93B36?style=flat-square&logo=backblaze&logoColor=white) |
| language | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) |
| deployment | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* Node.js 18+
* A MongoDB database (MongoDB Atlas free tier works)
* A Backblaze B2 bucket for storing `.docx` chord/lyric files

```sh
npm install npm@latest -g
```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/teddycitrus/songchart.git
   cd songchart
   ```

2. Install dependencies
   ```sh
   npm install
   ```

3. Create a `.env.local` file in the project root and fill in your values
   ```env
   MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/songchart"

   B2_ENDPOINT="https://s3.us-west-004.backblazeb2.com"
   B2_BUCKET_NAME="your-bucket-name"
   B2_KEY_ID="your-key-id"
   B2_APP_KEY="your-app-key"

   JWT_SECRET="a-long-random-secret"
   ```

4. Start the development server
   ```sh
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE -->
## Usage

**Browse the repertoire**

the home dashboard lists all songs with their key, BPM, and capo. Click any song to open a detail view with the chord sheet rendered inline from the `.docx` file stored in Backblaze B2.

**Setlist generator**

open the setlist picker, configure song weights if needed, and generate a randomised set. Songs with higher weights appear more frequently in the output.

**Add or remove songs**

authenticated users can create new entries or delete outdated ones. The song schema looks like this:

```json
{
  "name": "10,000 Reasons",
  "key": "G Major",
  "transpose": 0,
  "capo": "none",
  "bpm": 77,
  "beat": "4/4",
  "chords": "https://f004.backblazeb2.com/file/your-bucket/10000-reasons.docx"
}
```

**API routes** — all data operations go through Next.js API routes under `/pages/api`:

| route | method | description |
|---|---|---|
| `/api/songs` | `GET` | Fetch all song entries from MongoDB |
| `/api/edit` | `POST` | Create a new song entry |
| `/api/auth` | `POST` | Authenticate and receive a JWT |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] Song database with full metadata and inline `.docx` viewer powered by Backblaze B2 and `mammoth`
- [x] Weighted setlist generator for randomised rehearsal and performance sets
- [X] Full CRUD; update and delete operations exposed in the UI for authorised members
- [ ] Multiple repertoire support for managing separate song lists across special masses and performances

See the [open issues](https://github.com/teddycitrus/songchart/issues) for a full list of proposed features and known bugs.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are welcome. If you have a suggestion, please fork the repo and open a pull request, or file an issue with the `enhancement` label.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a pull request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Project Link: [https://github.com/teddycitrus/songchart](https://github.com/teddycitrus/songchart)

Live App: [https://sacmchoir.vercel.app](https://sacmchoir.vercel.app)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & BADGES -->
[contributors-shield]: https://img.shields.io/github/contributors/teddycitrus/songchart.svg?style=for-the-badge
[contributors-url]: https://github.com/teddycitrus/songchart/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/teddycitrus/songchart.svg?style=for-the-badge
[forks-url]: https://github.com/teddycitrus/songchart/network/members
[stars-shield]: https://img.shields.io/github/stars/teddycitrus/songchart.svg?style=for-the-badge
[stars-url]: https://github.com/teddycitrus/songchart/stargazers
[issues-shield]: https://img.shields.io/github/issues/teddycitrus/songchart.svg?style=for-the-badge
[issues-url]: https://github.com/teddycitrus/songchart/issues
[license-shield]: https://img.shields.io/github/license/teddycitrus/songchart.svg?style=for-the-badge
[license-url]: https://github.com/teddycitrus/songchart/blob/main/LICENSE
