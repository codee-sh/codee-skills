#!/bin/sh
set -eu

SKILLS_REPO="$(cd "$(dirname "$0")" && pwd)"

usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS] <project-path>

Options:
  --general               Copy general skills
  --framework <name>      Copy skills for a specific framework (e.g. medusa, nextjs)
  --all                   Copy all skills (general + all frameworks)
  -h, --help              Show this help

Examples:
  $(basename "$0") --general /path/to/project
  $(basename "$0") --framework medusa /path/to/project
  $(basename "$0") --general --framework medusa /path/to/project
  $(basename "$0") --all /path/to/project
EOF
}

copy_skill() {
  skill_source="$1"
  target_skills_dir="$2"
  skill_name="$(basename "$skill_source")"
  dest="$target_skills_dir/$skill_name"

  mkdir -p "$target_skills_dir"

  if [ -e "$dest" ] && [ ! -d "$dest" ]; then
    echo "Error: $dest exists and is not a directory. Remove it and re-run." >&2
    exit 1
  fi

  rm -rf "$dest"
  cp -r "$skill_source" "$dest"
  echo "Copied  $skill_name -> $dest"
}

copy_skills_from_dir() {
  source_dir="$1"
  target_dir="$2"

  if [ ! -d "$source_dir" ]; then
    echo "Warning: skills directory not found: $source_dir" >&2
    return
  fi

  for skill in "$source_dir"/*/; do
    [ -d "$skill" ] || continue
    copy_skill "$(cd "$skill" && pwd)" "$target_dir"
  done
}

# --- Parse arguments ---

DO_GENERAL=0
DO_ALL=0
FRAMEWORKS=""
PROJECT_PATH=""

while [ $# -gt 0 ]; do
  case "$1" in
    --general)
      DO_GENERAL=1
      shift
      ;;
    --framework)
      shift
      [ $# -gt 0 ] || { echo "Error: --framework requires a name." >&2; usage; exit 1; }
      FRAMEWORKS="$FRAMEWORKS $1"
      shift
      ;;
    --all)
      DO_ALL=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      if [ -z "$PROJECT_PATH" ]; then
        PROJECT_PATH="$1"
        shift
      else
        echo "Error: unexpected argument: $1" >&2
        usage
        exit 1
      fi
      ;;
  esac
done

if [ -z "$PROJECT_PATH" ]; then
  echo "Error: <project-path> is required." >&2
  usage
  exit 1
fi

if [ ! -d "$PROJECT_PATH" ]; then
  echo "Error: project path does not exist: $PROJECT_PATH" >&2
  exit 1
fi

TARGET_SKILLS_DIR="$PROJECT_PATH/.ai/skills"

# --- Execute ---

if [ "$DO_ALL" = "1" ]; then
  copy_skills_from_dir "$SKILLS_REPO/general" "$TARGET_SKILLS_DIR"

  for fw_dir in "$SKILLS_REPO/frameworks"/*/; do
    [ -d "$fw_dir" ] || continue
    copy_skills_from_dir "$fw_dir" "$TARGET_SKILLS_DIR"
  done

elif [ "$DO_GENERAL" = "1" ] || [ -n "$FRAMEWORKS" ]; then
  if [ "$DO_GENERAL" = "1" ]; then
    copy_skills_from_dir "$SKILLS_REPO/general" "$TARGET_SKILLS_DIR"
  fi

  for fw in $FRAMEWORKS; do
    fw_dir="$SKILLS_REPO/frameworks/$fw"
    if [ ! -d "$fw_dir" ]; then
      echo "Error: no skills found for framework: $fw (expected $fw_dir)" >&2
      exit 1
    fi
    copy_skills_from_dir "$fw_dir" "$TARGET_SKILLS_DIR"
  done

else
  echo "Error: specify at least one of --general, --framework <name>, or --all." >&2
  usage
  exit 1
fi

echo ""
echo "Skills installed to $TARGET_SKILLS_DIR"
echo ""
echo "Now link them into .claude/skills by running the project's install-skills.sh:"
echo "  $PROJECT_PATH/scripts/install-skills.sh"
