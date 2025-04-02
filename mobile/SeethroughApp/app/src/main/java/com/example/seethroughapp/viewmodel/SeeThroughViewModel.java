package com.example.seethroughapp.viewmodel;

import android.util.Log;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.seethroughapp.model.ingredient.Ingredient;
import com.example.seethroughapp.model.ingredient.IngredientWrapper;
import com.example.seethroughapp.model.inoutlog.InOutLog;
import com.example.seethroughapp.model.inoutlog.InOutLogWrapper;
import com.example.seethroughapp.network.ApiService;
import com.example.seethroughapp.network.RetrofitInstance;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SeeThroughViewModel extends ViewModel {
    private MutableLiveData<List<Ingredient>> ingredients = new MutableLiveData<>();
    private MutableLiveData<List<InOutLog>> inOutLogs = new MutableLiveData<>();

    public LiveData<List<Ingredient>> getIngredients() {
        return ingredients;
    }
    public LiveData<List<InOutLog>> getInOutLogs() { return inOutLogs; }

    public void fetchIngredients() {
        // Retrofit 호출 또는 데이터 가져오기
        ApiService apiService = RetrofitInstance.getRetrofitInstance().create(ApiService.class);
        apiService.getIngredients().enqueue(new Callback<IngredientWrapper>() {
            @Override
            public void onResponse(Call<IngredientWrapper> call, Response<IngredientWrapper> response) {
                if (response.isSuccessful()) {
                    if (response.body() != null) {
                        ingredients.setValue(response.body().getContent());
                    } else {
                        Log.e("Ingredients", "Response body is null");
                    }
                } else {
                    Log.e("Ingredients", "API request failed");
                }
            }


            @Override
            public void onFailure(Call<IngredientWrapper> call, Throwable t) {
                Log.e("Ingredients", "데이터 로드 실패: " + t.toString());
            }
        });
    }

    public void fetchInOutLogs(){
        ApiService apiService = RetrofitInstance.getRetrofitInstance().create(ApiService.class);
        apiService.getInOutLogs().enqueue(new Callback<InOutLogWrapper>() {
            @Override
            public void onResponse(Call<InOutLogWrapper> call, Response<InOutLogWrapper> response) {
                if (response.isSuccessful()){
                    if(response.body() != null){
                        inOutLogs.setValue(response.body().getContent());
                    } else {
                        Log.e("InOutLog", "Response body is null");
                    }
                } else {
                    Log.e("InOutLog", "API request failed");
                }
            }

            @Override
            public void onFailure(Call<InOutLogWrapper> call, Throwable t) {
                Log.e("InOutLog", "데이터 로드 실패: " + t.toString());
            }
        });

    }
}
