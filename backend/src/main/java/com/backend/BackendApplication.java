package com.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        loadDotenvIntoSystemProperties();
        SpringApplication.run(BackendApplication.class, args);
    }

    private static void loadDotenvIntoSystemProperties() {
        for (Path envFile : List.of(
                Paths.get(".env"),
                Paths.get("backend", ".env"),
                Paths.get("..", "backend", ".env")
        )) {
            if (!Files.isRegularFile(envFile)) {
                continue;
            }

            Path absoluteEnvFile = envFile.toAbsolutePath();
            Path envDirectory = absoluteEnvFile.getParent() == null
                ? Paths.get(".").toAbsolutePath()
                : absoluteEnvFile.getParent();

            Dotenv dotenv = Dotenv.configure()
                .directory(envDirectory.toString())
                    .filename(envFile.getFileName().toString())
                    .ignoreIfMalformed()
                    .ignoreIfMissing()
                    .load();

            dotenv.entries().forEach(entry -> {
                if (System.getenv(entry.getKey()) == null && System.getProperty(entry.getKey()) == null) {
                    System.setProperty(entry.getKey(), entry.getValue());
                }
            });
            return;
        }
    }
}
