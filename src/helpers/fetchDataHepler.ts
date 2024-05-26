interface Character {
    id: number;
    name: string;
    image: string;
    episode: string[];
  }

export const fetchDataHelper = async (query: string): Promise<Character[]> => {
    try {
      const response = await fetch(
        `https://rickandmortyapi.com/api/character/?name=${query}`
      );
      const data = await response.json();
      return data.results || []; // Return an empty array if no results are found
    } catch (error) {
      console.error("Error fetching characters:", error);
      throw error;
    }
  };
  