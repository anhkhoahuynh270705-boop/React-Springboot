// Service gọi API cho Movie
export async function getMovies() {
  try {
    const res = await fetch('http://localhost:8080/api/movies');
    if (!res.ok) throw new Error('Không thể lấy danh sách phim');
    return await res.json();
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw new Error('Không thể kết nối đến server');
  }
}

export async function getMovieById(id) {
  try {
    const res = await fetch(`http://localhost:8080/api/movies/${id}`);
    if (!res.ok) throw new Error('Không thể lấy thông tin phim');
    return await res.json();
  } catch (error) {
    console.error('Error fetching movie:', error);
    throw new Error('Không thể kết nối đến server');
  }
}
