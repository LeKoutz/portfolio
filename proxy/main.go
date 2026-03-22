package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
)

type Project struct {
	Name		string	// Name of the project
	Path		string	// URL path prefix, eg. "/ascii-art/"
	Port		string	// Port number where the project is running, eg. "8082"
	Image		string	// Optional: For future use, to display project images on the portfolio page
	TechStack	[]string // Optional: For future use, to display the tech stack used in the project
	Repository	string	// Optional: For future use, to link to the project's GitHub repository
}

func main() {
	// Set up projects
	projects := []Project{
		{Name: "ASCII Art Generator", Path: "/ascii-art/", Port: "8082"},
		{Name: "Groupie Tracker", Path: "/groupie-tracker/", Port: "8083"},
	}

	// Set up reverse proxies for each project
	for _, project := range projects {
		url, err := url.Parse("http://localhost:" + project.Port)
		if err != nil {
			log.Fatal(err)
		}
		proxy := httputil.NewSingleHostReverseProxy(url)
		http.Handle(project.Path, http.StripPrefix(project.Path, proxy))
	}

	// Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Proxy running on :" + port)
	log.Fatal(http.ListenAndServe(":" + port, nil))
}