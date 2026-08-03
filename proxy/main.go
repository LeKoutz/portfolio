package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"html/template"
	"encoding/json"
	"time"
	"fmt"
	"path"
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
	LastUpdated	string
}

type ProjectConfig struct {
	Repository	string	`json:"repo"`
	Live		bool	`json:"live"`
	Exclude		bool	`json:"exclude"`
	Image		string	`json:"image"`
	ExtraTechStack []string `json:"extraTechStack"`
}

type GitHubRepo struct {
	Name		string	`json:"name"`
	Description	string	`json:"description"`
	Language	string	`json:"language"`
	UpdatedAt	string	`json:"updated_at"`
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
			Repository:		"LeKoutz/ascii-art-web",
		},
		{
			Title: 			"Groupie Tracker", 
			Description: 	"Music artist browser with search, filtering, and geolocation mapping of concert locations.",
			Path: 			"/groupie-tracker/",
			Port: 			"8083",
			Repository: 	"LeKoutz/groupie-tracker",
		},
	}
	filtered := []Project{}
	for i, p := range projects {
		if cfg, ok := configMap[p.Repository]; ok {
			if cfg.Exclude {
				continue
			}
			projects[i].Live = cfg.Live
			projects[i].Image = cfg.Image
			gh, err := fetchGitHubRepo(p.Repository)
			if err != nil {
				log.Printf("Warning: could not fetch GitHub data for %s: %v", p.Repository, err)
			} else {
				projects[i].Title = gh.Name
				projects[i].Description = gh.Description
				projects[i].LastUpdated = gh.UpdatedAt
				projects[i].TechStack = []string{gh.Language}
				if len(cfg.ExtraTechStack) > 0 {
					projects[i].TechStack = append(projects[i].TechStack, cfg.ExtraTechStack...)
				}
			}
			filtered = append(filtered, projects[i])
		}
	}
	projects = filtered
	// Set up reverse proxies for each project
	for _, project := range projects {
		if project.Port == "" {
			dir := http.Dir("../projects/" + path.Base(project.Repository))
			fs := http.FileServer(dir)
			http.Handle(project.Path, http.StripPrefix(project.Path, fs))
		} else {
			url, err := url.Parse("http://localhost:" + project.Port)
			if err != nil {
				log.Fatal(err)
			}
			proxy := httputil.NewSingleHostReverseProxy(url)
			http.Handle(project.Path, http.StripPrefix(project.Path, proxy))
		}
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

func fetchGitHubRepo(repo string) (GitHubRepo, error) {
    url := "https://api.github.com/repos/" + repo
    resp, err := http.Get(url)
    if err != nil {
        return GitHubRepo{}, err
    }
    defer resp.Body.Close()
    if resp.StatusCode != http.StatusOK {
        return GitHubRepo{}, fmt.Errorf("GitHub API returned status %d for %s", resp.StatusCode, repo)
    }
    var gh GitHubRepo
    err = json.NewDecoder(resp.Body).Decode(&gh)
    if err != nil {
        return GitHubRepo{}, err
    }
    // Format updated_at from "2026-01-15T10:30:00Z" to "Jan 15, 2026"
    t, err := time.Parse(time.RFC3339, gh.UpdatedAt)
    if err == nil {
        gh.UpdatedAt = t.Format("Jan 02, 2006")
    }
    return gh, nil
}
