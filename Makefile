# Makefile for Portfolio Project
# =====================================
# Usage:
#   make update-all     		# pull updates from all subtrees
#   make clean          		# remove binaries

# Variables
PROXY_DIR := proxy

# =========================
# Update project subtrees
# =========================

.PHONY: update-all
update-all:
	@while IFS=' ' read -r repo branch port || [ -n "$$repo" ]; do \
		case "$$repo" in \#*|"") continue ;; esac; \
		prefix=$$(basename $$repo); \
		echo "Updating $$prefix..."; \
		git subtree pull --prefix=projects/$$prefix \
			https://github.com/$$repo $$branch --squash; \
		echo "✅ Updated $$prefix"; \
	done < projects.conf
	@echo "✅ All projects updated"

# =========================
# Clean binaries
# =========================

.PHONY: clean
clean:
	@while IFS=' ' read -r repo branch port || [ -n "$$repo" ]; do \
		case "$$repo" in \#*|"") continue ;; esac; \
		prefix=$$(basename $$repo); \
		rm -f projects/$$prefix/$$prefix; \
		echo "✅ Removed $$prefix binary"; \
	done < projects.conf
	@rm -f $(PROXY_DIR)/proxy
	@echo "✅ Removed proxy binary"
	@echo "✅ Clean complete"

# =========================
# Kill processes on ports
# =========================

.PHONY: kill-ports
kill-ports:
	@while IFS=' ' read -r repo branch port || [ -n "$$repo" ]; do \
		case "$$repo" in \#*|"") continue ;; esac; \
		case "$$port" in -|"") continue ;; esac; \
		lsof -ti :$$port | xargs kill 2>/dev/null || true; \
		echo "✅ Cleared port $$port"; \
	done < projects.conf
	@lsof -ti :8080 | xargs kill 2>/dev/null || true
	@echo "✅ Cleared port 8080 (proxy)"
	@echo "✅ All ports cleared"

# =========================
# Kill + clean
# =========================

.PHONY: clean-all
clean-all: kill-ports clean
	@echo "✅ Ports cleared and binaries removed"