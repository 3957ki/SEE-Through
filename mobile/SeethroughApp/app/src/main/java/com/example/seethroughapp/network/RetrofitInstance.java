package com.example.seethroughapp.network;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class RetrofitInstance {
    private static final String BASE_URL = "https://j12s002.p.ssafy.io/api/";

    private static Retrofit retrofit;

    public static Retrofit getRetrofitInstance() {
        if (retrofit == null) {
            // GsonBuilder를 사용하여 자동 변환 활성화
            Gson gson = new GsonBuilder()
                    .setFieldNamingPolicy(com.google.gson.FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES) // 스네이크 케이스와 카멜 케이스 자동 변환
                    .setDateFormat("yyyy-MM-dd'T'HH:mm:ss") // 날짜 형식 설정
                    .create();

            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .addConverterFactory(GsonConverterFactory.create(gson))
                    .build();
        }
        return retrofit;
    }
}
