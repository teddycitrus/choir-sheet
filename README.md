<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
<div align="center">
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

</div>  

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
- title, key, BPM, capo, and transposition stored in Convex, browsable from any phone, tablet, or desktop with real-time sync across all connected clients
**Inline document viewer**
- chord sheets and lyrics are stored as `.docx` files in Convex file storage and rendered in-browser via `mammoth`, with no download required
**Weighted setlist generator**
- builds randomised rehearsal and performance setlists, with configurable song weights so frequently-needed songs appear more often
**Protected write access**
- JWT-based authentication gates song creation and deletion, keeping the database clean

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

| layer | tools |
|---|---|
| frontend | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) |
| backend | ![Convex](https://img.shields.io/badge/Convex-EE342F?style=flat-square&logo=convex&logoColor=white) |
| language | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) |
| deployment | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* Node.js 18+
* A Convex account (free tier works)

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

3. Initialise Convex — this will prompt a GitHub login, create a project, and write `NEXT_PUBLIC_CONVEX_URL` to `.env.local` automatically
   ```sh
   npx convex dev
   ```

4. Add the remaining values to `.env.local`
   ```env
   NEXT_PUBLIC_CONVEX_URL="https://your-deployment.convex.cloud"

   JWT_SECRET="a-long-random-secret"
   ```

5. Start the development server in a second terminal
   ```sh
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE -->
## Usage

**Browse the repertoire**

the home dashboard lists all songs with their key, BPM, and capo. Click any song to open a detail view with the chord sheet rendered inline from the `.docx` file stored in Convex file storage. The list updates in real time across all connected clients.

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
  "storageId": "<convex storage id>"
}
```

**Backend functions** — all data operations are handled by Convex functions in `convex/`:

| function | type | description |
|---|---|---|
| `songs.list` | query | Fetch all songs — reactive, auto-updates on change |
| `songs.create` | mutation | Create a new song entry |
| `songs.remove` | mutation | Delete a song and its stored file |
| `songs.generateUploadUrl` | mutation | Get a short-lived URL for `.docx` file upload |
| `songs.saveStorageId` | mutation | Persist a file's storage ID onto a song document |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] Song database with full metadata and inline `.docx` viewer powered by Convex file storage and `mammoth`
- [x] Weighted setlist generator for randomised rehearsal and performance sets
- [x] Full CRUD; update and delete operations exposed in the UI for authorised members
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
