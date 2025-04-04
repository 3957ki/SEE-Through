package com.example.seethroughapp.network;

import com.example.seethroughapp.data.model.dto.FCMTokenRequest;
import com.example.seethroughapp.data.model.ingredient.IngredientWrapper;
import com.example.seethroughapp.data.model.inoutlog.InOutLogWrapper;
import com.example.seethroughapp.data.model.meal.Meal;
import com.example.seethroughapp.data.model.meal.Meals;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.PATCH;
import retrofit2.http.POST;
import retrofit2.http.Query;

public interface ApiService {

    @GET("ingredients")
    Call<IngredientWrapper> getIngredients(
            @Query("memberId") String memberId,
            @Query("size") int size
    );

    @GET("ingredient-logs")
    Call<InOutLogWrapper> getInOutLogs(
            @Query("size") int size
    );

    @POST("fcm/token")
    Call<ResponseBody> sendToken(@Body FCMTokenRequest request);

    @GET("meals")
    Call<Meals> getMeals(
            @Query("memberId") String memberId,
            @Query("servingDate") String servingDate
    );

    @PATCH("meals/refresh")
    Call<Meal> refreshMeal(
            @Query("mealId") String mealId
    );
}
