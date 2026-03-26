# Makefile for Portfolio Project
# =====================================
# Usage:
#   make update-all     		# pull updates from all subtrees
#   make update-groupie-tracker # pull update from groupie-tracker repo
#   make update-ascii-art   	# pull update from ascii-art repo
#   make clean          		# remove binaries

# Variables
ASCII-ART_DIR := projects/ascii-art-web
GROUPIE-TRACKER_DIR := projects/groupie-tracker
PROXY_DIR := proxy

ASCII-ART_BIN := $(ASCII-ART_DIR)/ascii-art
GROUPIE-TRACKER_BIN := $(GROUPIE-TRACKER_DIR)/groupie-tracker
PROXY_BIN := $(PROXY_DIR)/proxy

# =========================
# Update project subtrees
# =========================
.PHONY: update-groupie-tracker
update-groupie-tracker:
	git subtree pull --prefix=projects/groupie-tracker https://github.com/LeKoutz/groupie-tracker portfolio_version --squash
	@echo "✅ Pulled latest changes from groupie-tracker repository"

.PHONY: update-ascii-art
update-ascii-art:
	git subtree pull --prefix=projects/ascii-art-web https://github.com/LeKoutz/ascii-art-web portfolio_version --squash
	@echo "✅ Pulled latest changes from ascii-art repository"

.PHONY: update-all
update-all: update-groupie-tracker update-ascii-art
	@echo "✅ All project subtrees updated"

# =========================
# Clean binaries
# =========================
.PHONY: clean
clean:
	rm -f $(ASCII-ART_BIN) $(GROUPIE-TRACKER_BIN) $(PROXY_BIN)
	@echo "✅ Cleaned all binaries"