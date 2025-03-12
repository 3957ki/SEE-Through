import axios from "axios";

const LOCAL_SERVER_URL = import.meta.env.VITE_LOCAL_SERVER_URL ?? "http://localhost:8080";
const API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL ?? "https://localhost:3000";

export function LocalServerFetcher() {
  return axios.create({
    baseURL: LOCAL_SERVER_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function ServerMembersFetcher() {
  return axios.create({
    baseURL: API_SERVER_URL + "/members",
    headers: {
      "Content-Type": "application/json",
    },
  });
}
