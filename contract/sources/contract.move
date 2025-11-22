/// Module: contract
/// Decentralized Content Management System (CMS) on Sui Blockchain
/// This module manages permissions (Admin/Author capabilities) and content metadata
/// Content itself is stored on Walrus storage as BLOBs
module contract::contract;

use sui::table;
use sui::table::Table;
use std::string::String;

// ==================== Error Codes ====================

/// Error: Caller is not authorized to perform this operation
#[allow(unused_const)]
const ENotAuthorized: u64 = 1;

/// Error: Page does not exist
#[allow(unused_const)]
const EPageNotFound: u64 = 2;

/// Error: Invalid BLOB ID provided
#[allow(unused_const)]
const EInvalidBlobId: u64 = 3;

/// Error: Edit request not found
#[allow(unused_const)]
const EEditRequestNotFound: u64 = 4;

/// Error: Edit request already processed
#[allow(unused_const)]
const EEditRequestAlreadyProcessed: u64 = 5;

// ==================== Structs ====================

/// Global registry for the CMS system
/// This is a shared object that tracks all pages and system configuration
public struct CMS_Registry has key {
    id: UID,
    /// Total number of pages created
    total_pages: u64,
    /// Mapping from page_id to Page_Metadata object ID
    page_registry: Table<u64, address>,
    /// Timestamp when registry was created
    created_at: u64,
}

/// Admin capability - allows granting author capabilities and creating pages
/// This is a non-copyable, non-droppable resource
public struct Admin_Capability has key, store {
    id: UID,
    /// Timestamp when this capability was issued
    issued_at: u64,
}

/// Author capability - allows updating page content
/// This is a non-copyable, non-droppable resource
public struct Author_Capability has key, store {
    id: UID,
    /// Address of the author
    author: address,
    /// Timestamp when this capability was issued
    issued_at: u64,
}

/// Metadata for a page stored on Walrus
/// This is a shared object that can be updated by authorized authors
public struct Page_Metadata has key {
    id: UID,
    /// Unique page identifier
    page_id: u64,
    /// Walrus BLOB ID where content is stored
    walrus_blob_id: String,
    /// Version number (increments on each update)
    version: u64,
    /// Address of the page owner/author
    author: address,
    /// Timestamp of last update
    updated_at: u64,
    /// Timestamp when page was created
    created_at: u64,
    /// Whether the page is deleted (soft delete)
    deleted: bool,
    /// Edit requests for this page (request_id -> Edit_Request)
    edit_requests: Table<u64, Edit_Request>,
    /// Next edit request ID
    next_request_id: u64,
}

/// Edit request from a reader
public struct Edit_Request has store {
    /// Unique request identifier
    request_id: u64,
    /// Page ID this request is for
    page_id: u64,
    /// Address of the requester
    requester: address,
    /// New Walrus BLOB ID with edited content
    new_walrus_blob_id: String,
    /// Status: 0 = pending, 1 = approved, 2 = rejected
    status: u8,
    /// Timestamp when request was created
    created_at: u64,
    /// Timestamp when request was processed (approved/rejected)
    processed_at: u64,
}

// ==================== Events ====================
// Note: Events are commented out to avoid test dependency issues
// Uncomment when deploying to a live network

// /// Event emitted when a new page is created
// public struct PageCreatedEvent has copy, drop {
//     page_id: u64,
//     page_metadata_address: address,
//     author: address,
//     walrus_blob_id: String,
//     timestamp: u64,
// }

// /// Event emitted when page content is updated
// public struct PageUpdatedEvent has copy, drop {
//     page_id: u64,
//     new_walrus_blob_id: String,
//     new_version: u64,
//     author: address,
//     timestamp: u64,
// }

// /// Event emitted when an author capability is granted
// public struct AuthorCapabilityGrantedEvent has copy, drop {
//     recipient: address,
//     granted_by: address,
//     timestamp: u64,
// }

// ==================== Initialization ====================

/// Initialize the CMS system
/// Creates the registry and grants initial admin capability to the deployer
fun init(ctx: &mut TxContext) {
    // Create the global CMS registry
    let registry = CMS_Registry {
        id: object::new(ctx),
        total_pages: 0,
        page_registry: table::new(ctx),
        created_at: tx_context::epoch_timestamp_ms(ctx),
    };
    
    // Share the registry so anyone can read it
    transfer::share_object(registry);
    
    // Create and transfer admin capability to the deployer
    let admin_cap = Admin_Capability {
        id: object::new(ctx),
        issued_at: tx_context::epoch_timestamp_ms(ctx),
    };
    
    transfer::transfer(admin_cap, tx_context::sender(ctx));
}

// ==================== Admin Functions ====================

/// Grant author capability to a specified address
/// Only callable by admin capability holder
#[allow(lint(public_entry))]
public entry fun grant_author_capability(
    _admin_cap: &Admin_Capability,
    recipient: address,
    ctx: &mut TxContext
) {
    let author_cap = Author_Capability {
        id: object::new(ctx),
        author: recipient,
        issued_at: tx_context::epoch_timestamp_ms(ctx),
    };
    
    // Transfer capability to recipient
    transfer::transfer(author_cap, recipient);
}

/// Create a new page with initial content
/// Only callable by admin or author capability holder
#[allow(lint(public_entry))]
public entry fun create_page(
    _author_cap: &Author_Capability,
    registry: &mut CMS_Registry,
    initial_walrus_blob_id: String,
    ctx: &mut TxContext
) {
    let page_id = registry.total_pages;
    let author = tx_context::sender(ctx);
    let timestamp = tx_context::epoch_timestamp_ms(ctx);
    
    // Create page metadata
    let page_metadata = Page_Metadata {
        id: object::new(ctx),
        page_id,
        walrus_blob_id: initial_walrus_blob_id,
        version: 0,
        author,
        updated_at: timestamp,
        created_at: timestamp,
        deleted: false,
        edit_requests: table::new(ctx),
        next_request_id: 0,
    };
    
    let page_metadata_address = object::uid_to_address(&page_metadata.id);
    
    // Update registry
    registry.total_pages = registry.total_pages + 1;
    table::add(&mut registry.page_registry, page_id, page_metadata_address);
    
    // Share the page metadata so it can be read by anyone and updated by authorized users
    transfer::share_object(page_metadata);
}

// ==================== Author Functions ====================

/// Update page content with a new Walrus BLOB ID
/// Only callable by author capability holder
#[allow(lint(public_entry))]
public entry fun update_page_content(
    _author_cap: &Author_Capability,
    page: &mut Page_Metadata,
    new_walrus_blob_id: String,
    ctx: &mut TxContext
) {
    // Check if page is deleted
    assert!(!page.deleted, EPageNotFound);
    
    // Update the BLOB ID and increment version
    page.walrus_blob_id = new_walrus_blob_id;
    page.version = page.version + 1;
    page.updated_at = tx_context::epoch_timestamp_ms(ctx);
}

/// Delete a page (soft delete - marks as deleted)
/// Only callable by the page author
#[allow(lint(public_entry))]
public entry fun delete_page(
    _author_cap: &Author_Capability,
    page: &mut Page_Metadata,
    ctx: &mut TxContext
) {
    // Check if page is already deleted
    assert!(!page.deleted, EPageNotFound);
    
    // Check if caller is the author
    assert!(page.author == tx_context::sender(ctx), ENotAuthorized);
    
    // Mark as deleted (soft delete)
    page.deleted = true;
    page.updated_at = tx_context::epoch_timestamp_ms(ctx);
}

// ==================== Reader Functions ====================

/// Create an edit request for a page
/// Anyone can create an edit request
#[allow(lint(public_entry))]
public entry fun create_edit_request(
    page: &mut Page_Metadata,
    new_walrus_blob_id: String,
    ctx: &mut TxContext
) {
    // Check if page is deleted
    assert!(!page.deleted, EPageNotFound);
    
    // Check if requester is not the author (authors should use update_page_content directly)
    assert!(page.author != tx_context::sender(ctx), ENotAuthorized);
    
    let request_id = page.next_request_id;
    let timestamp = tx_context::epoch_timestamp_ms(ctx);
    
    let edit_request = Edit_Request {
        request_id,
        page_id: page.page_id,
        requester: tx_context::sender(ctx),
        new_walrus_blob_id,
        status: 0, // pending
        created_at: timestamp,
        processed_at: 0,
    };
    
    // Add request to page
    table::add(&mut page.edit_requests, request_id, edit_request);
    page.next_request_id = page.next_request_id + 1;
}

// ==================== Author Functions (Edit Requests) ====================

/// Approve an edit request and update page content
/// Only callable by the page author
#[allow(lint(public_entry))]
public entry fun approve_edit_request(
    _author_cap: &Author_Capability,
    page: &mut Page_Metadata,
    request_id: u64,
    ctx: &mut TxContext
) {
    // Check if page is deleted
    assert!(!page.deleted, EPageNotFound);
    
    // Check if caller is the author
    assert!(page.author == tx_context::sender(ctx), ENotAuthorized);
    
    // Get the edit request
    assert!(table::contains(&page.edit_requests, request_id), EEditRequestNotFound);
    let edit_request = table::borrow_mut(&mut page.edit_requests, request_id);
    
    // Check if request is still pending
    assert!(edit_request.status == 0, EEditRequestAlreadyProcessed);
    
    // Update page content with the new BLOB ID
    page.walrus_blob_id = edit_request.new_walrus_blob_id;
    page.version = page.version + 1;
    page.updated_at = tx_context::epoch_timestamp_ms(ctx);
    
    // Mark request as approved
    edit_request.status = 1; // approved
    edit_request.processed_at = tx_context::epoch_timestamp_ms(ctx);
}

/// Reject an edit request
/// Only callable by the page author
#[allow(lint(public_entry))]
public entry fun reject_edit_request(
    _author_cap: &Author_Capability,
    page: &mut Page_Metadata,
    request_id: u64,
    ctx: &mut TxContext
) {
    // Check if page is deleted
    assert!(!page.deleted, EPageNotFound);
    
    // Check if caller is the author
    assert!(page.author == tx_context::sender(ctx), ENotAuthorized);
    
    // Get the edit request
    assert!(table::contains(&page.edit_requests, request_id), EEditRequestNotFound);
    let edit_request = table::borrow_mut(&mut page.edit_requests, request_id);
    
    // Check if request is still pending
    assert!(edit_request.status == 0, EEditRequestAlreadyProcessed);
    
    // Mark request as rejected
    edit_request.status = 2; // rejected
    edit_request.processed_at = tx_context::epoch_timestamp_ms(ctx);
}

// ==================== View Functions ====================

/// Get page information
public fun get_page_info(page: &Page_Metadata): (u64, String, u64, address, u64, u64, bool) {
    (
        page.page_id,
        page.walrus_blob_id,
        page.version,
        page.author,
        page.created_at,
        page.updated_at,
        page.deleted
    )
}

/// Get registry statistics
public fun get_registry_stats(registry: &CMS_Registry): (u64, u64) {
    (registry.total_pages, registry.created_at)
}

/// Get the Walrus BLOB ID for a page
public fun get_walrus_blob_id(page: &Page_Metadata): String {
    page.walrus_blob_id
}

/// Get the version of a page
public fun get_version(page: &Page_Metadata): u64 {
    page.version
}

/// Get the page ID
public fun get_page_id(page: &Page_Metadata): u64 {
    page.page_id
}

/// Get the author of a page
public fun get_author(page: &Page_Metadata): address {
    page.author
}

/// Get edit request information
public fun get_edit_request_info(request: &Edit_Request): (u64, u64, address, String, u8, u64, u64) {
    (
        request.request_id,
        request.page_id,
        request.requester,
        request.new_walrus_blob_id,
        request.status,
        request.created_at,
        request.processed_at
    )
}

/// Get the next request ID for a page
public fun get_next_request_id(page: &Page_Metadata): u64 {
    page.next_request_id
}

// ==================== Test-Only Functions ====================

#[test_only]
/// Initialize function for testing
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}
