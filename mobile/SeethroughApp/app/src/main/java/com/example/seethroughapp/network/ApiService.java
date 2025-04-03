package com.example.seethroughapp.network;

import com.example.seethroughapp.data.model.dto.FCMTokenRequest;
import com.example.seethroughapp.data.model.ingredient.IngredientWrapper;
import com.example.seethroughapp.data.model.inoutlog.InOutLogWrapper;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;

public interface ApiService {

    @GET("ingredients")
    Call<IngredientWrapper> getIngredients();

    @GET("ingredient-logs")
    Call<InOutLogWrapper> getInOutLogs();

    @POST("fcm/token")
    Call<ResponseBody> sendToken(@Body FCMTokenRequest request);
}
