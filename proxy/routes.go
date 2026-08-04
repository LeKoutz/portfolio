package main

import (
	"html/template"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"path/filepath"
	"strings"
)

// setupRoutes registers all HTTP handlers.
func setupRoutes(projects []Project, tmpl *template.Template) *http.ServeMux {
	mux := http.NewServeMux()
	registerLiveProjectsRoutes(mux, projects)
	registerPageRoutes(mux, tmpl, projects)
	registerStaticRoute(mux)
	return mux
}

// registerLiveProjectsRoutes sets up reverse proxies and file servers for deployed projects.
func registerLiveProjectsRoutes(mux *http.ServeMux, projects []Project) {
	for _, project := range projects {
		if project.Path == "" {
			continue
		}
		if project.Port == "" {
			dir := http.Dir("../projects/" + filepath.Base(project.Repository))
			fs := http.FileServer(dir)
			mux.Handle(project.Path, http.StripPrefix(project.Path, fs))
		} else {
			target, err := url.Parse("http://localhost:" + project.Port)
			if err != nil {
				log.Fatal(err)
			}
			proxy := httputil.NewSingleHostReverseProxy(target)
			mux.Handle(project.Path, http.StripPrefix(project.Path, proxy))
		}
	}
}

// registerPageRoutes maps URL paths to their page handlers.
func registerPageRoutes(mux *http.ServeMux, tmpl *template.Template, projects []Project) {
	type route struct {
		path    string
		handler http.HandlerFunc
	}
	routes := []route{
		{"/", homeHandler(tmpl, projects)},
		{"/projects", projectsHandler(tmpl, projects)},
	}
	for _, r := range routes {
		mux.HandleFunc(r.path, r.handler)
	}
}

// registerStaticRoute serves the portfolio's own public static files.
func registerStaticRoute(mux *http.ServeMux) {
	fs := http.FileServer(http.Dir("public"))
	mux.Handle("/proxy/public/", http.StripPrefix("/proxy/public/", fs))
}

func homeHandler(tmpl *template.Template, projects []Project) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		data := PageData{Projects: projects}
		if err := tmpl.ExecuteTemplate(w, "index", data); err != nil {
			log.Println(err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		}
	}
}

func projectsHandler(tmpl *template.Template, projects []Project) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var filtered []Project
		exists := make(map[string]bool)
		query := strings.TrimSpace(strings.ToLower(r.FormValue("q")))
		if query == "" {
			filtered = projects
		} else {
			for _, p := range projects {
				for _, stack := range p.TechStack {
					if strings.Contains(strings.ToLower(stack), query) {
						if !exists[p.Title] {
							filtered = append(filtered, p)
							exists[p.Title] = true
						}
					}
				}
				if strings.Contains(strings.ToLower(p.Title), query) ||
					strings.Contains(strings.ToLower(p.Description), query) ||
					strings.Contains(strings.ToLower(p.LastUpdated), query) {
						if !exists[p.Title] {
							filtered = append(filtered, p)
							exists[p.Title] = true
						}
				}
			}
		}
		data := PageData{
			Projects: filtered,
			SearchQuery: query,
		}
		if err := tmpl.ExecuteTemplate(w, "index", data); err != nil {
			log.Println(err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		}
	}
}
