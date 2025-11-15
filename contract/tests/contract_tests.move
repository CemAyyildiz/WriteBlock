#[test_only]
module contract::contract_tests;

use contract::contract::{
    Self,
    CMS_Registry,
    Admin_Capability,
    Author_Capability,
    Page_Metadata
};
use sui::test_scenario::{Self as ts, Scenario};
use std::string;

// Test addresses
const ADMIN: address = @0xAD;
const AUTHOR1: address = @0xA1;
const AUTHOR2: address = @0xA2;

// ==================== Helper Functions ====================

/// Initialize the CMS system and return the scenario
fun setup_test(): Scenario {
    let mut scenario = ts::begin(ADMIN);
    {
        contract::init_for_testing(ts::ctx(&mut scenario));
    };
    scenario
}

// ==================== Initialization Tests ====================

#[test]
fun test_init_creates_registry_and_admin_capability() {
    let mut scenario = setup_test();
    
    // Check that admin received the admin capability
    ts::next_tx(&mut scenario, ADMIN);
    {
        assert!(ts::has_most_recent_for_sender<Admin_Capability>(&scenario), 0);
    };
    
    // Check that registry was created and shared
    ts::next_tx(&mut scenario, ADMIN);
    {
        let registry = ts::take_shared<CMS_Registry>(&scenario);
        let (total_pages, _created_at) = contract::get_registry_stats(&registry);
        assert!(total_pages == 0, 1);
        ts::return_shared(registry);
    };
    
    ts::end(scenario);
}

// ==================== Admin Function Tests ====================

#[test]
fun test_admin_can_grant_author_capability() {
    let mut scenario = setup_test();
    
    // Admin grants author capability to AUTHOR1
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = ts::take_from_sender<Admin_Capability>(&scenario);
        contract::grant_author_capability(&admin_cap, AUTHOR1, ts::ctx(&mut scenario));
        ts::return_to_sender(&scenario, admin_cap);
    };
    
    // Check that AUTHOR1 received the capability
    ts::next_tx(&mut scenario, AUTHOR1);
    {
        assert!(ts::has_most_recent_for_address<Author_Capability>(AUTHOR1), 2);
    };
    
    ts::end(scenario);
}

#[test]
fun test_admin_can_grant_multiple_author_capabilities() {
    let mut scenario = setup_test();
    
    // Admin grants capabilities to multiple authors
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = ts::take_from_sender<Admin_Capability>(&scenario);
        contract::grant_author_capability(&admin_cap, AUTHOR1, ts::ctx(&mut scenario));
        contract::grant_author_capability(&admin_cap, AUTHOR2, ts::ctx(&mut scenario));
        ts::return_to_sender(&scenario, admin_cap);
    };
    
    // Check that both authors received capabilities
    ts::next_tx(&mut scenario, AUTHOR1);
    {
        assert!(ts::has_most_recent_for_address<Author_Capability>(AUTHOR1), 3);
    };
    
    ts::next_tx(&mut scenario, AUTHOR2);
    {
        assert!(ts::has_most_recent_for_address<Author_Capability>(AUTHOR2), 4);
    };
    
    ts::end(scenario);
}

// ==================== Page Creation Tests ====================

#[test]
fun test_author_can_create_page() {
    let mut scenario = setup_test();
    
    // Admin grants author capability
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = ts::take_from_sender<Admin_Capability>(&scenario);
        contract::grant_author_capability(&admin_cap, AUTHOR1, ts::ctx(&mut scenario));
        ts::return_to_sender(&scenario, admin_cap);
    };
    
    // Author creates a page
    ts::next_tx(&mut scenario, AUTHOR1);
    {
        let author_cap = ts::take_from_sender<Author_Capability>(&scenario);
        let mut registry = ts::take_shared<CMS_Registry>(&scenario);
        
        let blob_id = string::utf8(b"walrus_blob_id_12345");
        contract::create_page(&author_cap, &mut registry, blob_id, ts::ctx(&mut scenario));
        
        ts::return_to_sender(&scenario, author_cap);
        ts::return_shared(registry);
    };
    
    // Verify page was created
    ts::next_tx(&mut scenario, AUTHOR1);
    {
        let registry = ts::take_shared<CMS_Registry>(&scenario);
        let (total_pages, _) = contract::get_registry_stats(&registry);
        assert!(total_pages == 1, 5);
        ts::return_shared(registry);
    };
    
    ts::end(scenario);
}

#[test]
fun test_create_multiple_pages() {
    let mut scenario = setup_test();
    
    // Admin grants author capability
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = ts::take_from_sender<Admin_Capability>(&scenario);
        contract::grant_author_capability(&admin_cap, AUTHOR1, ts::ctx(&mut scenario));
        ts::return_to_sender(&scenario, admin_cap);
    };
    
    // Author creates multiple pages
    ts::next_tx(&mut scenario, AUTHOR1);
    {
        let author_cap = ts::take_from_sender<Author_Capability>(&scenario);
        let mut registry = ts::take_shared<CMS_Registry>(&scenario);
        
        contract::create_page(&author_cap, &mut registry, string::utf8(b"blob_1"), ts::ctx(&mut scenario));
        contract::create_page(&author_cap, &mut registry, string::utf8(b"blob_2"), ts::ctx(&mut scenario));
        contract::create_page(&author_cap, &mut registry, string::utf8(b"blob_3"), ts::ctx(&mut scenario));
        
        ts::return_to_sender(&scenario, author_cap);
        ts::return_shared(registry);
    };
    
    // Verify all pages were created
    ts::next_tx(&mut scenario, AUTHOR1);
    {
        let registry = ts::take_shared<CMS_Registry>(&scenario);
        let (total_pages, _) = contract::get_registry_stats(&registry);
        assert!(total_pages == 3, 6);
        ts::return_shared(registry);
    };
    
    ts::end(scenario);
}

// ==================== Page Update Tests ====================

#[test]
fun test_author_can_update_page_content() {
    let mut scenario = setup_test();
    
    // Setup: grant capability and create page
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = ts::take_from_sender<Admin_Capability>(&scenario);
        contract::grant_author_capability(&admin_cap, AUTHOR1, ts::ctx(&mut scenario));
        ts::return_to_sender(&scenario, admin_cap);
    };
    
    ts::next_tx(&mut scenario, AUTHOR1);
    {
        let author_cap = ts::take_from_sender<Author_Capability>(&scenario);
        let mut registry = ts::take_shared<CMS_Registry>(&scenario);
        
        contract::create_page(&author_cap, &mut registry, string::utf8(b"initial_blob"), ts::ctx(&mut scenario));
        
        ts::return_to_sender(&scenario, author_cap);
        ts::return_shared(registry);
    };
    
    // Update the page content
    ts::next_tx(&mut scenario, AUTHOR1);
    {
        let author_cap = ts::take_from_sender<Author_Capability>(&scenario);
        let mut page = ts::take_shared<Page_Metadata>(&scenario);
        
        let new_blob_id = string::utf8(b"updated_blob");
        contract::update_page_content(&author_cap, &mut page, new_blob_id, ts::ctx(&mut scenario));
        
        // Verify version incremented
        let version = contract::get_version(&page);
        assert!(version == 1, 7);
        
        // Verify blob ID updated
        let blob_id = contract::get_walrus_blob_id(&page);
        assert!(blob_id == string::utf8(b"updated_blob"), 8);
        
        ts::return_to_sender(&scenario, author_cap);
        ts::return_shared(page);
    };
    
    ts::end(scenario);
}

#[test]
fun test_multiple_updates_increment_version() {
    let mut scenario = setup_test();
    
    // Setup
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = ts::take_from_sender<Admin_Capability>(&scenario);
        contract::grant_author_capability(&admin_cap, AUTHOR1, ts::ctx(&mut scenario));
        ts::return_to_sender(&scenario, admin_cap);
    };
    
    ts::next_tx(&mut scenario, AUTHOR1);
    {
        let author_cap = ts::take_from_sender<Author_Capability>(&scenario);
        let mut registry = ts::take_shared<CMS_Registry>(&scenario);
        
        contract::create_page(&author_cap, &mut registry, string::utf8(b"initial"), ts::ctx(&mut scenario));
        
        ts::return_to_sender(&scenario, author_cap);
        ts::return_shared(registry);
    };
    
    // Perform multiple updates
    ts::next_tx(&mut scenario, AUTHOR1);
    {
        let author_cap = ts::take_from_sender<Author_Capability>(&scenario);
        let mut page = ts::take_shared<Page_Metadata>(&scenario);
        
        contract::update_page_content(&author_cap, &mut page, string::utf8(b"update_1"), ts::ctx(&mut scenario));
        contract::update_page_content(&author_cap, &mut page, string::utf8(b"update_2"), ts::ctx(&mut scenario));
        contract::update_page_content(&author_cap, &mut page, string::utf8(b"update_3"), ts::ctx(&mut scenario));
        
        // Verify version is 3
        let version = contract::get_version(&page);
        assert!(version == 3, 9);
        
        ts::return_to_sender(&scenario, author_cap);
        ts::return_shared(page);
    };
    
    ts::end(scenario);
}

// ==================== View Function Tests ====================

#[test]
fun test_get_page_info() {
    let mut scenario = setup_test();
    
    // Setup and create page
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = ts::take_from_sender<Admin_Capability>(&scenario);
        contract::grant_author_capability(&admin_cap, AUTHOR1, ts::ctx(&mut scenario));
        ts::return_to_sender(&scenario, admin_cap);
    };
    
    ts::next_tx(&mut scenario, AUTHOR1);
    {
        let author_cap = ts::take_from_sender<Author_Capability>(&scenario);
        let mut registry = ts::take_shared<CMS_Registry>(&scenario);
        
        contract::create_page(&author_cap, &mut registry, string::utf8(b"test_blob"), ts::ctx(&mut scenario));
        
        ts::return_to_sender(&scenario, author_cap);
        ts::return_shared(registry);
    };
    
    // Get page info
    ts::next_tx(&mut scenario, AUTHOR1);
    {
        let page = ts::take_shared<Page_Metadata>(&scenario);
        
        let (page_id, blob_id, version, author, _created_at, _updated_at) = contract::get_page_info(&page);
        
        assert!(page_id == 0, 10);
        assert!(blob_id == string::utf8(b"test_blob"), 11);
        assert!(version == 0, 12);
        assert!(author == AUTHOR1, 13);
        
        ts::return_shared(page);
    };
    
    ts::end(scenario);
}

#[test]
fun test_get_individual_fields() {
    let mut scenario = setup_test();
    
    // Setup
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = ts::take_from_sender<Admin_Capability>(&scenario);
        contract::grant_author_capability(&admin_cap, AUTHOR1, ts::ctx(&mut scenario));
        ts::return_to_sender(&scenario, admin_cap);
    };
    
    ts::next_tx(&mut scenario, AUTHOR1);
    {
        let author_cap = ts::take_from_sender<Author_Capability>(&scenario);
        let mut registry = ts::take_shared<CMS_Registry>(&scenario);
        
        contract::create_page(&author_cap, &mut registry, string::utf8(b"my_blob"), ts::ctx(&mut scenario));
        
        ts::return_to_sender(&scenario, author_cap);
        ts::return_shared(registry);
    };
    
    // Test individual getters
    ts::next_tx(&mut scenario, AUTHOR1);
    {
        let page = ts::take_shared<Page_Metadata>(&scenario);
        
        assert!(contract::get_page_id(&page) == 0, 14);
        assert!(contract::get_walrus_blob_id(&page) == string::utf8(b"my_blob"), 15);
        assert!(contract::get_version(&page) == 0, 16);
        assert!(contract::get_author(&page) == AUTHOR1, 17);
        
        ts::return_shared(page);
    };
    
    ts::end(scenario);
}

// ==================== Integration Tests ====================

#[test]
fun test_full_workflow() {
    let mut scenario = setup_test();
    
    // Step 1: Admin grants capabilities to two authors
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = ts::take_from_sender<Admin_Capability>(&scenario);
        contract::grant_author_capability(&admin_cap, AUTHOR1, ts::ctx(&mut scenario));
        contract::grant_author_capability(&admin_cap, AUTHOR2, ts::ctx(&mut scenario));
        ts::return_to_sender(&scenario, admin_cap);
    };
    
    // Step 2: AUTHOR1 creates a page
    ts::next_tx(&mut scenario, AUTHOR1);
    {
        let author_cap = ts::take_from_sender<Author_Capability>(&scenario);
        let mut registry = ts::take_shared<CMS_Registry>(&scenario);
        
        contract::create_page(&author_cap, &mut registry, string::utf8(b"author1_page"), ts::ctx(&mut scenario));
        
        ts::return_to_sender(&scenario, author_cap);
        ts::return_shared(registry);
    };
    
    // Step 3: AUTHOR2 creates a page
    ts::next_tx(&mut scenario, AUTHOR2);
    {
        let author_cap = ts::take_from_sender<Author_Capability>(&scenario);
        let mut registry = ts::take_shared<CMS_Registry>(&scenario);
        
        contract::create_page(&author_cap, &mut registry, string::utf8(b"author2_page"), ts::ctx(&mut scenario));
        
        ts::return_to_sender(&scenario, author_cap);
        ts::return_shared(registry);
    };
    
    // Step 4: Verify registry has 2 pages
    ts::next_tx(&mut scenario, ADMIN);
    {
        let registry = ts::take_shared<CMS_Registry>(&scenario);
        let (total_pages, _) = contract::get_registry_stats(&registry);
        assert!(total_pages == 2, 18);
        ts::return_shared(registry);
    };
    
    ts::end(scenario);
}
