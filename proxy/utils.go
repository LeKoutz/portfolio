package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

// loadProjectsFromJSON reads projects.json and returns a slice of ProjectConfig
// containing display metadata for all projects (live, wip, exclude, extraTechStack).
func loadProjectsFromJSON(path string) ([]ProjectConfig, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var projects []ProjectConfig
	err = json.Unmarshal(data, &projects)
	return projects, err
}

// loadProjectsFromConf reads projects.conf and returns a map of repo -> port
// for all deployed projects. Used to enrich display metadata with deployment info.
// Projects not present in this map are not deployed and will have no routing set up.
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

// fetchGitHubRepo calls the GitHub public API for a given repo
// and returns its name, description, primary language, and last push date.
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
