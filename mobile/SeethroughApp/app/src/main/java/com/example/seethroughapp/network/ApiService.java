package com.example.seethroughapp.network;

import com.example.seethroughapp.data.model.ingredient.IngredientWrapper;
import com.example.seethroughapp.data.model.inoutlog.InOutLogWrapper;

import retrofit2.Call;
import retrofit2.http.GET;

public interface ApiService {

    @GET("ingredients")
    Call<IngredientWrapper> getIngredients();

    @GET("ingredient-logs")
    Call<InOutLogWrapper> getInOutLogs();
}
