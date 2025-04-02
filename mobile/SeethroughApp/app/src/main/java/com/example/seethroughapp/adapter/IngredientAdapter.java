package com.example.seethroughapp.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.seethroughapp.R;
import com.example.seethroughapp.model.ingredient.Ingredient;

import java.util.List;

public class IngredientAdapter extends RecyclerView.Adapter<IngredientAdapter.IngredientViewHolder> {

    private List<Ingredient> ingredientsList;

    public IngredientAdapter(List<Ingredient> ingredientsList) {
        this.ingredientsList = ingredientsList;
    }

    @Override
    public IngredientViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View itemView = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_ingredient_card, parent, false);
        return new IngredientViewHolder(itemView);
    }

    @Override
    public void onBindViewHolder(IngredientViewHolder holder, int position) {
        Ingredient ingredient = ingredientsList.get(position);
        holder.nameTextView.setText(ingredient.getName());
        Glide.with(holder.itemView.getContext())
                .load(ingredient.getImagePath())
                .into(holder.iconImageView);
    }

    @Override
    public int getItemCount() {
        return ingredientsList != null ? ingredientsList.size() : 0;
    }

    public static class IngredientViewHolder extends RecyclerView.ViewHolder {
        public TextView nameTextView;
        public ImageView iconImageView;
        public CardView cardView;

        public IngredientViewHolder(View view) {
            super(view);
            nameTextView = view.findViewById(R.id.tv_ingredient_name);
            iconImageView = view.findViewById(R.id.img_ingredient_image);
            cardView = view.findViewById(R.id.card_ingredient);
        }
    }
}
