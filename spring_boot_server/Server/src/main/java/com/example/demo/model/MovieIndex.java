package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "movies")
public class MovieIndex {
    @Id
    private String id;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String title;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String titleNoSign;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String englishTitle;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String description;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String director;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String directorNoSign;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String actors;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String actorsNoSign;

    @Field(type = FieldType.Keyword)
    private String genre;

    @Field(type = FieldType.Keyword)
    private String status;

    @Field(type = FieldType.Integer)
    private int duration;

    @Field(type = FieldType.Keyword)
    private String imageUrl;

    @Field(type = FieldType.Keyword)
    private String releaseYear;

    @Field(type = FieldType.Keyword)
    private String movieName;

    @Field(type = FieldType.Keyword)
    private String name;

    @Field(type = FieldType.Double)
    private Double rating;
}
