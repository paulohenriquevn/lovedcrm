#!/usr/bin/env python3
"""
Direct database test for templates to isolate the hanging issue.
"""

import requests
import json
import sys
import os
import time

# Add the project root to Python path
sys.path.insert(0, os.path.abspath('.'))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

BASE_URL = "http://localhost:8001"
DATABASE_URL = "postgresql://postgres:postgres@localhost:5434/saas_test"

def test_direct_database():
    """Test direct database insert to see if it hangs."""
    print("🔍 Testing direct database access...")
    
    try:
        # Connect to database
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        print("✅ Database connection successful")
        
        # Test basic query
        result = db.execute(text("SELECT COUNT(*) FROM organizations")).scalar()
        print(f"✅ Basic query works - found {result} organizations")
        
        # Test template table access
        result = db.execute(text("SELECT COUNT(*) FROM message_templates")).scalar()
        print(f"✅ Template table query works - found {result} templates")
        
        # Test insert with raw SQL
        db.execute(text("""
            INSERT INTO message_templates (name, category, content, organization_id) 
            VALUES ('Direct Test', 'test', 'Hello {{name}}', 
                    (SELECT id FROM organizations LIMIT 1))
        """))
        db.commit()
        print("✅ Direct SQL insert works")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

def test_sqlalchemy_orm():
    """Test SQLAlchemy ORM operations to see if they hang."""
    print("🔍 Testing SQLAlchemy ORM...")
    
    try:
        # Import models to test if they load properly
        from api.models.message_template import MessageTemplate
        from api.models.organization import Organization
        print("✅ Model imports successful")
        
        # Create database session
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Test basic ORM query
        org_count = db.query(Organization).count()
        print(f"✅ ORM organization query works - found {org_count} organizations")
        
        # Get first organization for template creation
        org = db.query(Organization).first()
        if not org:
            print("❌ No organizations found")
            return False
        
        print(f"✅ Using organization: {org.id}")
        
        # Test template ORM operations
        template_count = db.query(MessageTemplate).count()
        print(f"✅ ORM template query works - found {template_count} templates")
        
        # Create template with ORM (this is where it might hang)
        print("🧪 Creating template with ORM...")
        
        # Start with a timeout wrapper
        import signal
        
        def timeout_handler(signum, frame):
            raise TimeoutError("Template creation timed out")
        
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(10)  # 10 second timeout
        
        try:
            template = MessageTemplate(
                organization_id=org.id,
                name="ORM Test Template",
                category="test",
                content="Hello {{test_var}}",
                variables=["test_var"]
            )
            
            db.add(template)
            print("✅ Template added to session")
            
            db.commit()
            print("✅ Template committed successfully")
            
            db.refresh(template)
            print(f"✅ Template refreshed - ID: {template.id}")
            
        except TimeoutError:
            print("❌ Template creation TIMED OUT - this is the hang!")
            return False
        finally:
            signal.alarm(0)  # Cancel timeout
            
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ ORM test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main test function."""
    print("🚀 Direct Template Database Test")
    print("=" * 50)
    
    # Test 1: Direct database access
    db_success = test_direct_database()
    
    print("\n" + "-" * 50)
    
    # Test 2: SQLAlchemy ORM
    orm_success = test_sqlalchemy_orm()
    
    print("\n" + "=" * 50)
    if db_success and orm_success:
        print("🎉 ALL DIRECT TESTS PASSED!")
        print("✅ Issue is NOT in database or ORM")
    elif db_success and not orm_success:
        print("🔧 DATABASE OK, ORM HAS ISSUES")
        print("❌ Issue is in SQLAlchemy ORM layer")
    else:
        print("❌ FUNDAMENTAL DATABASE ISSUES")
        print("🔧 Check database connection and schema")

if __name__ == "__main__":
    main()