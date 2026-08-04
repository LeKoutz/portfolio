package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type PageData struct {
	Projects []Project
}

type Project struct {
	Title		string
	Description string
	Path		string
	Port		string
	Live		bool
	WIP			bool
	TechStack	[]string
	Repository	string
	LastUpdated	string
}

type ProjectConfig struct {
	Repository	string	`json:"repo"`
	Live		bool	`json:"live"`
	WIP			bool	`json:"wip"`
	Exclude		bool	`json:"exclude"`
	ExtraTechStack []string `json:"extraTechStack"`
}

type GitHubRepo struct {
	Name		string	`json:"name"`
	Description	string	`json:"description"`
	Language	string	`json:"language"`
	UpdatedAt	string	`json:"pushed_at"`
}

func main() {
	// Projects
    projectsMeta, err := loadProjectsFromJSON("../projects.json")
    if err != nil {
        log.Fatal("Failed to load projects.json: ", err)
    }
    portMap, err := loadProjectsFromConf("../projects.conf")
    if err != nil {
        log.Fatal("Failed to load projects.conf: ", err)
    }
    projects := []Project{}
    for _, meta := range projectsMeta {
        if meta.Exclude {
            continue
        }
        p := Project{
            Repository: meta.Repository,
            Live:       meta.Live,
            WIP:        meta.WIP,
        }
        if port, ok := portMap[meta.Repository]; ok {
            p.Port = port
            p.Path = "/" + filepath.Base(meta.Repository) + "/"
        }
        gh, err := fetchGitHubRepo(meta.Repository)
        if err != nil {
            log.Printf("Warning: could not fetch GitHub data for %s: %v", meta.Repository, err)
        } else {
            p.Title = gh.Name
            p.Description = gh.Description
            p.LastUpdated = gh.UpdatedAt
            p.TechStack = []string{gh.Language}
            if len(meta.ExtraTechStack) > 0 {
                p.TechStack = append(p.TechStack, meta.ExtraTechStack...)
            }
        }
        projects = append(projects, p)
    }

    // Set up routing for deployed projects
    for _, project := range projects {
        if project.Path == "" {
            continue
        }
        if project.Port == "" {
            dir := http.Dir("../projects/" + filepath.Base(project.Repository))
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

    // Parse templates
    tmpl, err := template.ParseGlob("public/template/*.html")
    if err != nil {
        log.Fatal(err)
    }

    // Serve portfolio landing page
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

    // Serve static files for the portfolio
    fs := http.FileServer(http.Dir("public"))
    http.Handle("/proxy/public/", http.StripPrefix("/proxy/public/", fs))

    // Start the server
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    log.Println("Proxy running on :" + port)
    log.Fatal(http.ListenAndServe(":"+port, nil))
}

func loadProjectsFromJSON(path string) ([]ProjectConfig, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, err
    }
    var projects []ProjectConfig
    err = json.Unmarshal(data, &projects)
    return projects, err
}

func loadProjectsFromConf(confPath string) (map[string]string, error) {
    file, err := os.Open(confPath)
    if err != nil {
        return nil, err
    }
    defer file.Close()

    portMap := make(map[string]string)
    scanner := bufio.NewScanner(file)
    for scanner.Scan() {
        line := strings.TrimSpace(scanner.Text())
        if line == "" || strings.HasPrefix(line, "#") {
            continue
        }
        fields := strings.Fields(line)
        if len(fields) < 3 {
            continue
        }
        repo := fields[0]
        port := fields[2]
        if port == "-" {
            port = ""
        }
        portMap[repo] = port
    }
    return portMap, scanner.Err()
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
