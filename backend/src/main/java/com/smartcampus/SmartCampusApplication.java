package com.smartcampus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@SpringBootApplication
public class SmartCampusApplication {
    public static void main(String[] args) {
        loadDotenvIntoSystemProperties();
        SpringApplication.run(SmartCampusApplication.class, args);
    }

    private static void loadDotenvIntoSystemProperties() {
        for (Path envFile : List.of(
                Paths.get(".env"),
                Paths.get("backend", ".env"),
                Paths.get("..", "backend", ".env"))) {
            if (!Files.isRegularFile(envFile)) {
                continue;
            }

            Path absoluteEnvFile = envFile.toAbsolutePath();
            Path envDirectory = absoluteEnvFile.getParent() == null
                    ? Paths.get(".").toAbsolutePath()
                    : absoluteEnvFile.getParent();

            try (Stream<String> lines = Files.lines(envFile, StandardCharsets.UTF_8)) {
                lines.map(String::trim)
                        .filter(line -> !line.isEmpty() && !line.startsWith("#"))
                        .map(SmartCampusApplication::parseEnvLine)
                        .filter(entry -> entry != null && !entry.getKey().isBlank())
                        .forEach(entry -> {
                            if (System.getenv(entry.getKey()) == null && System.getProperty(entry.getKey()) == null) {
                                System.setProperty(entry.getKey(), entry.getValue());
                            }
                        });
            } catch (IOException ignored) {
                // If the env file cannot be read, fall back to default properties.
            }
            return;
        }
    }

    private static Map.Entry<String, String> parseEnvLine(String line) {
        int equalsIndex = line.indexOf('=');
        if (equalsIndex <= 0) {
            return null;
        }

        String key = line.substring(0, equalsIndex).trim();
        String value = line.substring(equalsIndex + 1).trim();

        if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length() - 1);
        }

        return Map.entry(key, value);
    }
}
