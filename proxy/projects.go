package main

import (
	"log"
	"path/filepath"
)

// buildProjects loads project metadata and deployment config,
// fetches GitHub data for each project, and returns the merged []Project slice.
func buildProjects() ([]Project, error) {
	projectsMeta, err := loadProjectsFromJSON("../projects.json")
	if err != nil {
		return nil, err
	}
	portMap, err := loadProjectsFromConf("../projects.conf")
	if err != nil {
		return nil, err
	}

	var projects []Project
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
	return projects, nil
}
