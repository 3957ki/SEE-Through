package com.example.seethroughapp.ui;

import android.content.Intent;
import android.media.Image;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.example.seethroughapp.R;
import com.example.seethroughapp.data.model.ingredient.Ingredient;
import com.example.seethroughapp.data.model.inoutlog.InOutLog;
import com.example.seethroughapp.data.model.meal.Meal;
import com.example.seethroughapp.viewmodel.SeeThroughViewModel;

import java.util.List;

public class SeeThroughActivity extends AppCompatActivity {

    private TextView firstMealType;
    private TextView firstMealContent;
    private ImageButton firstMealRefreshBtn;
    private ProgressBar firstMealProgress;
    private TextView secondMealType;
    private TextView secondMealContent;
    private ImageButton secondMealRefreshBtn;
    private ProgressBar secondMealProgress;

    private TextView ingredientText;
    private TextView inOutLogText;
    private SeeThroughViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_seethrough);

        LinearLayout ingredientView = findViewById(R.id.card_ingredients_info);
        ingredientView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(SeeThroughActivity.this, IngredientsActivity.class);
                startActivity(intent);
            }
        });

        LinearLayout inOutLogView = findViewById(R.id.card_inoutlogs_info);
        inOutLogView.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(SeeThroughActivity.this, InOutLogActivity.class);
                startActivity(intent);
            }
        });

        firstMealType = findViewById(R.id.tv_card_first_title);
        firstMealContent = findViewById(R.id.tv_card_first_content);
        firstMealRefreshBtn = findViewById(R.id.btn_first_refresh);
        firstMealRefreshBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

            }
        });
        firstMealProgress = findViewById(R.id.progress_first_meal);

        secondMealType = findViewById(R.id.tv_card_second_title);
        secondMealContent = findViewById(R.id.tv_card_second_content);
        secondMealRefreshBtn = findViewById(R.id.btn_second_refresh);
        secondMealRefreshBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

            }
        });
        secondMealProgress = findViewById(R.id.progress_second_meal);

        ingredientText = findViewById(R.id.tv_ingredients);
        inOutLogText = findViewById(R.id.tv_inoutlogs);

        viewModel = new ViewModelProvider(this).get(SeeThroughViewModel.class);
        viewModel.getIngredients().observe(this, this::displayIngredients);
        viewModel.getInOutLogs().observe(this, this::displayInOutLogs);
        viewModel.getFirstMeal().observe(this, this::displayFirstMeal);
        viewModel.getSecondMeal().observe(this, this::displaySecondMeal);
        viewModel.fetchMeals();
        viewModel.fetchIngredients(10);
        viewModel.fetchInOutLogs(10);
    }

    private void displayIngredients(List<Ingredient> data) {
        StringBuilder ingredientString = new StringBuilder();
        if (data != null && !data.isEmpty()){
            int maxCnt = Math.min(5, data.size());
            for (int i = 0; i < maxCnt; i++)
                ingredientString.append(data.get(i).getName()).append(" ");
            if (data.size() > 5) ingredientString.append("...");
        } else {
            ingredientString.append("재고 없음");
        }
        ingredientText.setText(ingredientString.toString());
    }

    private void displayInOutLogs(List<InOutLog> data){
        StringBuilder inOutLogString = new StringBuilder();
        if (data != null && !data.isEmpty()){
            InOutLog curLog = data.get(0);
            inOutLogString.append(curLog.getMemberName()).append(" ");
            inOutLogString.append(curLog.getIngredientName()).append(" ");
            inOutLogString.append(curLog.getMovementName());
        } else {
            inOutLogString.append("출고 기록 없음");
        }
        inOutLogText.setText(inOutLogString.toString());
    }

    private void displayFirstMeal(Meal data){
        if (data == null) return;
        firstMealType.setText(data.getServingTime());
        StringBuilder foods = new StringBuilder();
        for (String food : data.getMenu())
            foods.append(food).append("\n");
        firstMealContent.setText(foods.toString());
    }

    private void displaySecondMeal(Meal data){
        if (data == null) return;
        secondMealType.setText(data.getServingTime());
        StringBuilder foods = new StringBuilder();
        for (String food : data.getMenu())
            foods.append(food).append("\n");
        secondMealContent.setText(foods.toString());
    }
}
