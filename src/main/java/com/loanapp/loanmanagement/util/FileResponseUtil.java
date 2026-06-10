package com.loanapp.loanmanagement.util;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

public final class FileResponseUtil {

    private FileResponseUtil() {
    }

    public static MediaType resolveMediaType(String fileName) {
        if (fileName == null) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        }
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG;
        }
        if (lower.endsWith(".pdf")) {
            return MediaType.APPLICATION_PDF;
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    public static ResponseEntity<Resource> build(Resource resource, boolean inline) {
        String fileName = resource.getFilename() != null ? resource.getFilename() : "document";
        return build(resource, fileName, inline);
    }

    public static ResponseEntity<Resource> build(Resource resource, String fileName, boolean inline) {
        String resolvedName = fileName != null && !fileName.isBlank()
                ? fileName
                : (resource.getFilename() != null ? resource.getFilename() : "document");
        MediaType mediaType = resolveMediaType(resolvedName);
        String disposition = inline
                ? "inline; filename=\"" + resolvedName + "\""
                : "attachment; filename=\"" + resolvedName + "\"";
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .body(resource);
    }
}
