package com.example.seethroughapp.network;

import com.example.seethroughapp.model.ingredient.IngredientWrapper;

import retrofit2.Call;
import retrofit2.http.GET;

public interface ApiService {

    @GET("ingredients")
    Call<IngredientWrapper> getIngredients();
}
