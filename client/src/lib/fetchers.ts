import axios from "axios";

const LOCAL_SERVER_URL = import.meta.env.VITE_LOCAL_SERVER_URL ?? "http://localhost:9000";
const API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL ?? "http://localhost:8080";

// Local Vision API 객체
export const LocalServerFetcher = axios.create({
  baseURL: LOCAL_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Spring API 객체
export const APIServerFetcher = axios.create({
  baseURL: API_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export function ServerMembersFetcher() {
  return axios.create({
    baseURL: API_SERVER_URL + "/members",
    headers: {
      "Content-Type": "application/json",
    },
  });
}
