package com.example.seethroughapp.viewmodel;

import android.util.Log;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.seethroughapp.data.model.ingredient.Ingredient;
import com.example.seethroughapp.data.model.ingredient.IngredientWrapper;
import com.example.seethroughapp.data.model.inoutlog.InOutLog;
import com.example.seethroughapp.data.model.inoutlog.InOutLogWrapper;
import com.example.seethroughapp.data.model.meal.Meal;
import com.example.seethroughapp.data.model.meal.Meals;
import com.example.seethroughapp.network.ApiService;
import com.example.seethroughapp.network.RetrofitInstance;
import com.example.seethroughapp.util.Var;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;

public class SeeThroughViewModel extends ViewModel {
    private MutableLiveData<List<Ingredient>> ingredients = new MutableLiveData<>();
    private MutableLiveData<List<InOutLog>> inOutLogs = new MutableLiveData<>();

    private MutableLiveData<Boolean> isFirstMealLoading = new MutableLiveData<>(false);
    private MutableLiveData<Meal> firstMeal = new MutableLiveData<>();
    private MutableLiveData<Boolean> isSecondMealLoading = new MutableLiveData<>(false);
    private MutableLiveData<Meal> secondMeal = new MutableLiveData<>();


    public LiveData<List<Ingredient>> getIngredients() {
        return ingredients;
    }
    public LiveData<List<InOutLog>> getInOutLogs() { return inOutLogs; }
    public LiveData<Boolean> getIsFirstMealLoading(){ return isFirstMealLoading; }
    public LiveData<Meal> getFirstMeal() { return firstMeal; }
    public LiveData<Boolean> getIsSecondMealLoading(){ return isSecondMealLoading; }
    public LiveData<Meal> getSecondMeal() { return secondMeal; }

    public void refreshFirstMeal(){
        isFirstMealLoading.setValue(true);
        ApiService apiService = RetrofitInstance.getRetrofitInstance().create(ApiService.class);
        apiService.refreshMeal(getFirstMeal().getValue().getMealId()).enqueue(new Callback<Meal>() {
            @Override
            public void onResponse(Call<Meal> call, Response<Meal> response) {
                if (response.isSuccessful()){
                    if (response.body() != null){
                        firstMeal.setValue(response.body());
                        isFirstMealLoading.postValue(false);
                    } else {
                        Log.e("Meal", "Response body is null");
                    }
                }else {
                    Log.e("Meal", "API request failled");
                }
            }

            @Override
            public void onFailure(Call<Meal> call, Throwable t) {

            }
        });
    }

    public void refreshSecondMeal(){
        isSecondMealLoading.setValue(true);
        ApiService apiService = RetrofitInstance.getRetrofitInstance().create(ApiService.class);
        apiService.refreshMeal(getSecondMeal().getValue().getMealId()).enqueue(new Callback<Meal>() {
            @Override
            public void onResponse(Call<Meal> call, Response<Meal> response) {
                if (response.isSuccessful()){
                    if (response.body() != null){
                        secondMeal.setValue(response.body());
                        isSecondMealLoading.postValue(false);
                    } else {
                        Log.e("Meal", "Response body is null");
                    }
                }else {
                    Log.e("Meal", "API request failled");
                }
            }

            @Override
            public void onFailure(Call<Meal> call, Throwable t) {

            }
        });
    }

    public void fetchIngredients(int size) {
        // Retrofit 호출 또는 데이터 가져오기
        ApiService apiService = RetrofitInstance.getRetrofitInstance().create(ApiService.class);
        apiService.getIngredients(Var.memberId, size).enqueue(new Callback<IngredientWrapper>() {
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

    public void fetchInOutLogs(int size){
        ApiService apiService = RetrofitInstance.getRetrofitInstance().create(ApiService.class);
        apiService.getInOutLogs(size).enqueue(new Callback<InOutLogWrapper>() {
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

    public void fetchMeals(){
        ApiService apiService = RetrofitInstance.getRetrofitInstance().create(ApiService.class);

        Calendar calendar = Calendar.getInstance();
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        String today = dateFormat.format(calendar.getTime());

        int curHour = calendar.get(Calendar.HOUR_OF_DAY);

        apiService.getMeals(Var.memberId, today).enqueue(new Callback<Meals>() {
            @Override
            public void onResponse(Call<Meals> call, Response<Meals> response) {
                if (response.isSuccessful() && response.body() != null) {
                    if (curHour >= 0 && curHour < 10) {
                        firstMeal.setValue(response.body().getBreakfast());
                        secondMeal.setValue(response.body().getLunch());
                    }else if (curHour >= 10 && curHour < 16){
                        firstMeal.setValue(response.body().getLunch());
                        secondMeal.setValue(response.body().getDinner());
                    }else
                        firstMeal.setValue(response.body().getDinner());

                } else {
                    Log.e("Meals", "Failed to fetch today's meals");
                }
            }

            @Override
            public void onFailure(Call<Meals> call, Throwable t) {
                Log.e("Meals", "Failed to fetch first day's meals");
            }
        });

        if (curHour < 16) return;

        calendar.add(Calendar.DAY_OF_YEAR, 1);
        String tomorrow = dateFormat.format(calendar.getTime());
        apiService.getMeals(Var.memberId, tomorrow).enqueue(new Callback<Meals>() {
            @Override
            public void onResponse(Call<Meals> call, Response<Meals> response) {
                if (response.isSuccessful() && response.body() != null){
                    secondMeal.setValue(response.body().getBreakfast());
                } else {
                    Log.e("Meals", "Failed to fetch tomorrow's meals");
                }
            }

            @Override
            public void onFailure(Call<Meals> call, Throwable t) {
                Log.e("Meals", "Failed to fetch second day's meals");
            }
        });
    }
}
