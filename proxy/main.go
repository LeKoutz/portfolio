package main

import (
	"html/template"
	"log"
	"net/http"
	"os"
)

func main() {
	projects, err := buildProjects()
	if err != nil {
		log.Fatal("Failed to build projects: ", err)
	}

	tmpl, err := template.ParseGlob("public/template/*.html")
	if err != nil {
		log.Fatal("Failed to parse templates: ", err)
	}

	mux := setupRoutes(projects, tmpl)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Proxy running on :" + port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
