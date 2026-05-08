# ASCII Art Web

A web application that converts text into ASCII art using different banner styles. Users can input text and select from various fonts to generate stylized ASCII art output.

## Features

- **ASCII Art Generation**: Convert text into ASCII art using multiple banner styles
- **Export Functionality**: Download generated ASCII art as a `.txt`, `.md` or `.http` file with proper formatting
- **Multiple Fonts**: Choose from various banner styles (standard, shadow, thinkertoy, zigzag)
- **Web Interface**: Clean, user-friendly interface with real-time generation
- **Dockerized**: Run the application inside a container

## How to Run

```bash
go run main.go
```

The server will start on `http://localhost:8080`

## Docker
You can run the application inside a Docker container

**Build the Docker image**
```bash
docker image build -f Dockerfile -t ascii-art-web-docker .
```

**Run the container**
```bash
docker container run -p 8080:8080 --detach --name dockerize ascii-art-web-docker
```
Now the server will be available at:
http://localhost:8080

**Using the provided script**

Alternatively, you can use the included script to build and run in one step
```bash
./dockerize.sh
```

**Check the file system**

```
docker exec -it dockerize sh

ls -l
```

**Inspect metadata**
```
docker inspect ascii-art-web-docker
```
For custom labels
```
sudo apt install jq

docker inspect ascii-art-web-docker | jq '.[0].Config.Labels'
```
## Project Structure

```bash
├── Dockerfile              # Dockerfile to create image and start container
├── LICENSE                 # MIT License
├── README.md
├── banners                 # ASCII art fonts
│   ├── shadow.txt
│   ├── standard.txt
│   ├── thinkertoy.txt
│   └── zigzag.txt
├── dockerize.sh            # Automated script to create container
├── go.mod                  # Go module definition
├── handlers
│   ├── handlers.go         # HTTP request handlers
│   └── handlers_test.go    # Handler unit tests
├── main.go                 # Entry point
├── main_test.go            # Integration and main package tests
│── static
│    ├── css
│    │   ├── style.css          # Fonts & text styles
│    └── ChatGPT Image          # Background png
├── services
│   ├── ascii-art.go
│   └── ascii-art_test.go
└── templates
    ├── error.html          # Error page template
    └── index.html          # Main page template
```

## Error Status Testing

### 400 Bad Request
- Submit empty text
- Submit text with non-ASCII characters

### 404 Not Found
- Visit any URL other than `/` or `/ascii-art`
- Example: `http://localhost:8080/nonexistent`

### 500 Internal Server Error
- Delete the `/templates/` directory

## Contributors

- ### Constantine Ktistakis
- ### Giorgos Koutzos
- ### Ioannis Kountouris