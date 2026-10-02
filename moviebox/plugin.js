(function () {
  // 1. getHome: Mengambil data beranda langsung dari API JSON AOneRoom
  async function getHome(cb) {
    try {
      // URL endpoint API home dengan parameter host
      const apiUrl =
        "https://h5-api.aoneroom.com/wefeed-h5api-bff/home?host=officialmoviebox.com";

      const json = await http_get(apiUrl);

      // Jika runtime Anda mengembalikan string, baris di bawah ini bertindak sebagai pengaman ganda:
      const dataObj = typeof json === "string" ? JSON.parse(json) : json;

      const categories = {};
      const sections =
        dataObj.data?.modules || dataObj.data?.list || dataObj.data || [];

      // Jika respons berupa array section atau objek tunggal, kita petakan ke kategori
      if (Array.isArray(sections)) {
        sections.forEach((section) => {
          const sectionTitle = section.title || section.name || "Trending";
          const items = [];

          const movieList =
            section.items || section.list || section.videos || [];
          movieList.forEach((item) => {
            // Ambil ID atau slug untuk URL detail
            const id = item.id || item.slug || item.movieId;
            const title = item.title || item.name;
            const cover = item.cover || item.poster || item.imageUrl;

            if (title && id) {
              items.push({
                title: title,
                // Format URL detail yang nantinya akan dibaca oleh fungsi load(url)
                url: `${manifest.baseUrl}/moviesDetail/${id}`,
                posterUrl: cover,
              });
            }
          });

          if (items.length > 0) {
            categories[sectionTitle] = items;
          }
        });
      }

      // Fallback jika struktur JSON langsung berupa array datar
      if (Object.keys(categories).length === 0 && Array.isArray(json.data)) {
        const items = [];
        json.data.forEach((item) => {
          const id = item.id || item.slug;
          if (item.title && id) {
            items.push({
              title: item.title,
              url: `${manifest.baseUrl}/moviesDetail/${id}`,
              posterUrl: item.cover || item.poster,
            });
          }
        });
        categories["Trending Movies"] = items;
      }

      cb({
        success: true,
        data: categories,
      });
    } catch (e) {
      console.error("Error fetching home API:", e);
      cb({ success: false, message: e.message });
    }
  }

  // 2. search: Menangani pencarian (jika Anda memiliki URL API search-nya juga)
  async function search(query, cb) {
    try {
      // Jika Anda menemukan endpoint search API-nya nanti, bisa dimasukkan ke sini
      const searchResults = [];
      cb({
        success: true,
        data: searchResults,
      });
    } catch (e) {
      cb({ success: false, message: e.message });
    }
  }

  // 3. load: Mengambil detail film berdasarkan URL/ID
  async function load(url, cb) {
    try {
      // Ekstrak ID dari URL (misal: /moviesDetail/bound-by-promise-CZ3PUrzXcW5 -> CZ3PUrzXcW5)
      const parts = url.split("/");
      const id = parts[parts.length - 1];

      // Anda bisa memanggil API detail jika menemukannya di Network Tab, contoh:
      // const detailUrl = `https://h5-api.aoneroom.com/.../detail?id=${id}`;

      cb({
        success: true,
        data: {
          title: "Movie Detail",
          description: "Detail sinopsis diambil dari API.",
          episodes: [],
        },
      });
    } catch (e) {
      cb({ success: false, message: e.message });
    }
  }

  // 4. loadStreams: Mengambil tautan video streaming
  async function loadStreams(url, cb) {
    try {
      const streams = [];
      // Ekstrak link stream (.m3u8 / MP4 / Embed) dari data detail API
      cb({
        success: true,
        data: streams,
      });
    } catch (e) {
      cb({ success: false, data: [] });
    }
  }

  globalThis.getHome = getHome;
  globalThis.search = search;
  globalThis.load = load;
  globalThis.loadStreams = loadStreams;
})();
