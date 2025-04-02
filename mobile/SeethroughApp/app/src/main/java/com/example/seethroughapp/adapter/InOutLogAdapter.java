package com.example.seethroughapp.adapter;

import android.graphics.Color;
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
import com.example.seethroughapp.model.inoutlog.InOutLog;

import java.util.List;

public class InOutLogAdapter extends RecyclerView.Adapter<InOutLogAdapter.InOutLogViewHolder>  {
    private List<InOutLog> inOutLogList;

    public InOutLogAdapter(List<InOutLog> inOutLogList) {
        this.inOutLogList = inOutLogList;
    }

    @Override
    public InOutLogAdapter.InOutLogViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View itemView = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_inoutlog_card, parent, false);
        return new InOutLogAdapter.InOutLogViewHolder(itemView);
    }

    @Override
    public void onBindViewHolder(InOutLogAdapter.InOutLogViewHolder holder, int position) {
        InOutLog inOutLog = inOutLogList.get(position);

        if ("입고".equals(inOutLog.getMovementName()))
            holder.inOutTypeTextView.setTextColor(Color.parseColor("#2196F3"));
        else if ("출고".equals(inOutLog.getMovementName()))
            holder.inOutTypeTextView.setTextColor(Color.parseColor("#F44336"));
        holder.ingredientTextView.setText(inOutLog.getIngredientName());
        holder.inOutTypeTextView.setText(inOutLog.getMovementName());
        holder.nameTextView.setText(inOutLog.getMemberName());
        holder.inOutTimeTextView.setText(inOutLog.getCreatedAt());
        Glide.with(holder.itemView.getContext())
                .load(inOutLog.getIngredientImagePath())
                .into(holder.iconImageView);
    }

    @Override
    public int getItemCount() {
        return inOutLogList != null ? inOutLogList.size() : 0;
    }

    public static class InOutLogViewHolder extends RecyclerView.ViewHolder {
        public TextView ingredientTextView;
        public TextView inOutTypeTextView;
        public TextView nameTextView;
        public TextView inOutTimeTextView;
        public ImageView iconImageView;
        public CardView cardView;

        public InOutLogViewHolder(View view) {
            super(view);
            inOutTypeTextView = view.findViewById(R.id.tv_inout_type);
            ingredientTextView = view.findViewById(R.id.tv_ingredient_name);
            nameTextView = view.findViewById(R.id.tv_client_name);
            inOutTimeTextView = view.findViewById(R.id.tv_inout_time);
            iconImageView = view.findViewById(R.id.img_ingredient_image);
            cardView = view.findViewById(R.id.card_inoutlog);
        }
    }
}
