package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"html/template"
	"encoding/json"
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

type ProjectConfig struct {
	Repository	string	`json:"repo"`
	Live		bool	`json:"live"`
	Exclude		bool	`json:"exclude"`
	Image		string	`json:"image"`
}

func main() {
	configs, err := loadProjectConfigs("../projects.json")
	if err != nil {
		log.Fatal("Failed to load projects.json: ", err)
	}
	configMap := make(map[string]ProjectConfig)
	for _, config := range configs {
		configMap[config.Repository] = config
	}
	// Set up projects
	projects := []Project{
		{
			Title: 			"ASCII Art Generator",
			Description: 	"Convert text into ASCII art using classic banner styles",
			Path:			"/ascii-art/",
			Port:			"8082",
			TechStack:		[]string{"Go", "HTML", "CSS"},
			Repository:		"LeKoutz/ascii-art-web",
		},
		{
			Title: 			"Groupie Tracker", 
			Description: 	"Music artist browser with search, filtering, and geolocation mapping of concert locations.",
			Path: 			"/groupie-tracker/",
			Port: 			"8083",
			TechStack: 		[]string{"Go", "JavaScript", "HTML", "CSS"},
			Repository: 	"LeKoutz/groupie-tracker",
		},
	}
	filtered := []Project{}
	for i, p := range projects {
		if cfg, ok := configMap[p.Repository]; ok {
			projects[i].Live = cfg.Live
			projects[i].Image = cfg.Image
			if !cfg.Exclude {
				filtered = append(filtered, projects[i])
			}
		}
	}
	projects = filtered
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

func loadProjectConfigs(path string) ([]ProjectConfig, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, err
    }
    var configs []ProjectConfig
    err = json.Unmarshal(data, &configs)
    return configs, err
}