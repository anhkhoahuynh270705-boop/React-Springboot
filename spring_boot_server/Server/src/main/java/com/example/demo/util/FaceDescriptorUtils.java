package com.example.demo.util;

import java.util.ArrayList;
import java.util.List;
public final class FaceDescriptorUtils {
    /*Threshold to decide whether two face descriptors are a match */
    public static final double SIMILARITY_THRESHOLD = 0.96;

    private FaceDescriptorUtils() {}
    public static List<Double> normalize(List<Double> descriptor) {
        if (descriptor == null || descriptor.isEmpty()) {
            return descriptor;
        }

        double norm = 0.0;
        for (Double val : descriptor) {
            norm += val * val;
        }
        norm = Math.sqrt(norm);

        if (norm == 0.0) {
            return descriptor;
        }

        List<Double> normalized = new ArrayList<>(descriptor.size());
        for (Double val : descriptor) {
            normalized.add(val / norm);
        }
        return normalized;
    }

    public static double cosineSimilarity(List<Double> a, List<Double> b) {
        if (a == null || b == null || a.isEmpty() || b.size() != a.size()) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;

        for (int i = 0; i < a.size(); i++) {
            double v1 = a.get(i);
            double v2 = b.get(i);
            dotProduct += v1 * v2;
            norm1 += v1 * v1;
            norm2 += v2 * v2;
        }

        double denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
        return denominator == 0.0 ? 0.0 : dotProduct / denominator;
    }
}
