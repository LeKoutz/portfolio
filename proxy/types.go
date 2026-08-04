package main

type PageData struct {
	Projects []Project
	SearchQuery string
}

type Project struct {
	Title       string
	Description string
	Path        string
	Port        string
	Live        bool
	WIP         bool
	TechStack   []string
	Repository  string
	LastUpdated string
}

type ProjectConfig struct {
	Repository     string   `json:"repo"`
	Live           bool     `json:"live"`
	WIP            bool     `json:"wip"`
	Exclude        bool     `json:"exclude"`
	ExtraTechStack []string `json:"extraTechStack"`
}

type GitHubRepo struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Language    string `json:"language"`
	UpdatedAt   string `json:"pushed_at"`
}
