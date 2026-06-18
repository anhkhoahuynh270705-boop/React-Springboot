# Use Java 21
FROM eclipse-temurin:21-jdk

# open folder in container
WORKDIR /app

# Copy file jar into container
COPY target/server-0.0.1-SNAPSHOT.jar app.jar

# open port backend
EXPOSE 8080

# run app
ENTRYPOINT ["java", "-jar", "app.jar"]
