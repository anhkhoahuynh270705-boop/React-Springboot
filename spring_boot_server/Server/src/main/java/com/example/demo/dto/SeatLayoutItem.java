package com.example.demo.dto;

import lombok.Data;

@Data
public class SeatLayoutItem {
    private String seatNumber; 
    private String row;        
    private int column;       

    private int rowIndex;
    private int colIndex;
    private int colSpan = 1;

    private String seatType = "REGULAR";
    private double price = 0.0;
}