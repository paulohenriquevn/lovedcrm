#!/usr/bin/env python3
"""
🏃‍♂️ API E2E Test Runner - Organized execution following CLAUDE.md

This runner executes tests in the correct order:
1. PRIORITY 1: Success scenarios (2XX) - Verify functionality works
2. PRIORITY 2: Validation scenarios (4XX) - Verify security and validation  
3. Edge cases and performance tests
"""
import subprocess
import sys
import time
from pathlib import Path


class Colors:
    """ANSI color codes for terminal output."""
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'


def print_header(text: str):
    """Print a colored header."""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.END}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(60)}{Colors.END}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.END}\n")


def print_section(text: str):
    """Print a colored section header."""
    print(f"\n{Colors.CYAN}{Colors.BOLD}{text}{Colors.END}")
    print(f"{Colors.CYAN}{'-' * len(text)}{Colors.END}")


def print_success(text: str):
    """Print success message."""
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")


def print_error(text: str):
    """Print error message."""
    print(f"{Colors.RED}❌ {text}{Colors.END}")


def print_warning(text: str):
    """Print warning message."""
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.END}")


def run_command(command: list, description: str) -> bool:
    """Run a command and return success status."""
    print(f"{Colors.BLUE}🚀 {description}...{Colors.END}")
    
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent
        )
        
        if result.returncode == 0:
            print_success(f"{description} completed")
            if result.stdout.strip():
                print(f"{Colors.CYAN}Output:{Colors.END}")
                print(result.stdout)
            return True
        else:
            print_error(f"{description} failed")
            if result.stderr.strip():
                print(f"{Colors.RED}Error:{Colors.END}")
                print(result.stderr)
            if result.stdout.strip():
                print(f"{Colors.YELLOW}Output:{Colors.END}")
                print(result.stdout)
            return False
            
    except FileNotFoundError:
        print_error(f"Command not found: {' '.join(command)}")
        return False
    except Exception as e:
        print_error(f"Error running {description}: {e}")
        return False


def run_pytest(test_pattern: str, description: str) -> bool:
    """Run pytest with specific pattern."""
    command = [
        "python", "-m", "pytest",
        "-v",
        "--tb=short",
        "--disable-warnings",
        test_pattern
    ]
    return run_command(command, description)


def main():
    """Main test runner."""
    print_header("🧪 API E2E TEST SUITE")
    print(f"{Colors.BOLD}Following CLAUDE.md GOLDEN RULE: FUNCTIONALITY FIRST{Colors.END}")
    print("Priority 1: Success scenarios (2XX) - Verify features work")
    print("Priority 2: Validation scenarios (4XX) - Verify security")
    print("Priority 3: Edge cases and performance tests")
    
    start_time = time.time()
    results = {}
    
    # Test categories in priority order
    test_categories = [
        # PRIORITY 1: Success scenarios (functionality first)
        {
            "name": "Authentication Success Tests",
            "pattern": "test_auth.py::TestAuthenticationSuccess",
            "priority": 1
        },
        {
            "name": "Users Success Tests", 
            "pattern": "test_users.py::TestUsersSuccess",
            "priority": 1
        },
        {
            "name": "Organizations Success Tests",
            "pattern": "test_organizations.py::TestOrganizationsSuccess", 
            "priority": 1
        },
        {
            "name": "API Health Tests",
            "pattern": "test_health.py::TestAPIHealth",
            "priority": 1
        },
        
        # PRIORITY 2: Validation scenarios (security and validation)
        {
            "name": "Authentication Validation Tests",
            "pattern": "test_auth.py::TestAuthenticationValidation",
            "priority": 2
        },
        {
            "name": "Users Validation Tests",
            "pattern": "test_users.py::TestUsersValidation", 
            "priority": 2
        },
        {
            "name": "Organizations Validation Tests",
            "pattern": "test_organizations.py::TestOrganizationsValidation",
            "priority": 2
        },
        
        # PRIORITY 3: Edge cases and advanced tests
        {
            "name": "Authentication Edge Cases",
            "pattern": "test_auth.py::TestAuthenticationEdgeCases",
            "priority": 3
        },
        {
            "name": "Users Edge Cases",
            "pattern": "test_users.py::TestUsersEdgeCases",
            "priority": 3
        },
        {
            "name": "Organizations Edge Cases", 
            "pattern": "test_organizations.py::TestOrganizationsEdgeCases",
            "priority": 3
        },
        {
            "name": "API Error Handling",
            "pattern": "test_health.py::TestAPIErrorHandling",
            "priority": 3
        },
        {
            "name": "API Performance Tests",
            "pattern": "test_health.py::TestAPIPerformance",
            "priority": 3
        },
        {
            "name": "API Security Tests",
            "pattern": "test_health.py::TestAPISecurity",
            "priority": 3
        }
    ]
    
    # Group tests by priority
    priority_groups = {
        1: [cat for cat in test_categories if cat["priority"] == 1],
        2: [cat for cat in test_categories if cat["priority"] == 2], 
        3: [cat for cat in test_categories if cat["priority"] == 3]
    }
    
    total_categories = len(test_categories)
    completed_categories = 0
    failed_categories = []
    
    # Run tests by priority
    for priority in [1, 2, 3]:
        priority_names = {
            1: "SUCCESS SCENARIOS (2XX) - FUNCTIONALITY FIRST",
            2: "VALIDATION SCENARIOS (4XX) - SECURITY & VALIDATION", 
            3: "EDGE CASES & PERFORMANCE"
        }
        
        print_section(f"PRIORITY {priority}: {priority_names[priority]}")
        
        for category in priority_groups[priority]:
            success = run_pytest(category["pattern"], category["name"])
            results[category["name"]] = success
            completed_categories += 1
            
            if not success:
                failed_categories.append(category["name"])
                
            # Progress indicator
            progress = (completed_categories / total_categories) * 100
            print(f"{Colors.BLUE}Progress: {progress:.1f}% ({completed_categories}/{total_categories}){Colors.END}")
            
            # Short pause between test categories
            time.sleep(0.5)
    
    # Final summary
    end_time = time.time()
    duration = end_time - start_time
    
    print_header("📊 TEST EXECUTION SUMMARY")
    
    success_count = sum(1 for success in results.values() if success)
    total_count = len(results)
    
    print(f"{Colors.BOLD}Total Test Categories:{Colors.END} {total_count}")
    print(f"{Colors.GREEN}Successful:{Colors.END} {success_count}")
    print(f"{Colors.RED}Failed:{Colors.END} {len(failed_categories)}")
    print(f"{Colors.BLUE}Duration:{Colors.END} {duration:.1f} seconds")
    
    if failed_categories:
        print_section("❌ Failed Categories")
        for category in failed_categories:
            print(f"  • {category}")
        
        print_warning("Some test categories failed. Check output above for details.")
        
        print_section("🔧 Debug Commands")
        print("To debug failed tests, run:")
        for category in failed_categories:
            pattern = next(cat["pattern"] for cat in test_categories if cat["name"] == category)
            print(f"  pytest -v -s {pattern}")
            
    else:
        print_success("All test categories passed! 🎉")
        print(f"{Colors.GREEN}🎯 API is 100% functional and secure!{Colors.END}")
    
    print_section("📚 Quick Commands")
    print("Run specific test types:")
    print(f"  {Colors.CYAN}pytest test_*.py -k Success{Colors.END}     # Success scenarios only")
    print(f"  {Colors.CYAN}pytest test_*.py -k Validation{Colors.END}  # Validation scenarios only")
    print(f"  {Colors.CYAN}pytest test_*.py -k EdgeCases{Colors.END}   # Edge cases only")
    print(f"  {Colors.CYAN}pytest test_*.py -v --tb=long{Colors.END}   # Verbose output with full tracebacks")
    
    # Return appropriate exit code
    sys.exit(0 if not failed_categories else 1)


if __name__ == "__main__":
    main()
