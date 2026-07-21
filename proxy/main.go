package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"html/template"
)

type PageData struct {
	Projects []Project
}

type Project struct {
	Title		string
	Description string
	Path		string
	Port		string
	Image		string	// Optional: For future use, to display project images on the portfolio page
	Live		bool
	TechStack	[]string
	Repository	string
}

func main() {
	// Set up projects
	projects := []Project{
		{
			Title: 			"ASCII Art Generator",
			Description: 	"Convert text into ASCII art using classic banner styles",
			Path:			"/ascii-art/",
			Port:			"8082",
			Live:			true,
			TechStack:		[]string{"Go", "HTML", "CSS"},
			Repository:		"https://github.com/LeKoutz/ascii-art-web",
		},
		{
			Title: 			"Groupie Tracker", 
			Description: 	"Music artist browser with search, filtering, and geolocation mapping of concert locations.",
			Path: 			"/groupie-tracker/",
			Port: 			"8083",
			Live: 			true,
			TechStack: 		[]string{"Go", "JavaScript", "HTML", "CSS"},
			Repository: 	"https://github.com/LeKoutz/groupie-tracker",
		},
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

	// Parse all templates together
	tmpl, err := template.ParseGlob("template/*.html")
	if err != nil {
    	log.Fatal(err)
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		data := PageData{Projects: projects}
    	err := tmpl.ExecuteTemplate(w, "index", data)
    	if err != nil {
        	log.Println(err)
        	http.Error(w, "Internal Server Error", http.StatusInternalServerError)
    	}
	})

	// Serve static files for the portfolio page
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/proxy/static/", http.StripPrefix("/proxy/static/", fs))

	// Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Proxy running on :" + port)
	log.Fatal(http.ListenAndServe(":" + port, nil))
}