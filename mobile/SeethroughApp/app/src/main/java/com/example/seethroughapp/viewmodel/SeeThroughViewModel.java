package com.example.seethroughapp.viewmodel;

import android.util.Log;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.seethroughapp.model.ingredient.Ingredient;
import com.example.seethroughapp.model.ingredient.IngredientWrapper;
import com.example.seethroughapp.network.ApiService;
import com.example.seethroughapp.network.RetrofitInstance;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SeeThroughViewModel extends ViewModel {
    private MutableLiveData<List<Ingredient>> data = new MutableLiveData<>();

    public LiveData<List<Ingredient>> getData() {
        return data;
    }

    public void fetchData() {
        Log.d("SeeThroughViewModel", "fetchData() 호출됨");
        // Retrofit 호출 또는 데이터 가져오기
        ApiService apiService = RetrofitInstance.getRetrofitInstance().create(ApiService.class);
        apiService.getIngredients().enqueue(new Callback<IngredientWrapper>() {
            @Override
            public void onResponse(Call<IngredientWrapper> call, Response<IngredientWrapper> response) {
                if (response.isSuccessful()) {
                    if (response.body() != null) {
                        data.setValue(response.body().getContent());
                    } else {
                        Log.e("SeeThroughViewModel", "Response body is null");
                    }
                } else {
                    Log.e("SeeThroughViewModel", "API request failed");
                }
            }


            @Override
            public void onFailure(Call<IngredientWrapper> call, Throwable t) {
                Log.e("SeeThroughViewModel", "데이터 로드 실패: " + t.toString());
            }
        });
    }
}
