CREATE SCHEMA IF NOT EXISTS librus;
SET SEARCH_PATH TO librus;
DROP TABLE IF EXISTS tbl_transactions;
DROP TABLE IF EXISTS tbl_placeholder;
DROP TABLE IF EXISTS tbl_reservations;
DROP TABLE IF EXISTS tbl_review;
DROP TABLE IF EXISTS tbl_users;
DROP TABLE IF EXISTS tbl_items;


CREATE TABLE tbl_placeholder
(
	fld_p_bookID CHAR(1024),
	fld_p_title CHAR(1024),
    fld_p_sortCharacter CHAR(1024),
	fld_p_primaryAuthor CHAR(1024),
	fld_p_primaryAuthorRole CHAR(1024),
    fld_p_secondaryAuthor CHAR(1024),
    fld_p_secondaryAuthorRole CHAR(1024),
    fld_p_secondaryPublication CHAR(1024),
    fld_p_date CHAR(1024),
    fld_p_review CHAR(1024),
    fld_p_rating CHAR(1024),
    fld_p_comment CHAR(1024),
    fld_p_privateComment CHAR(1024),
    fld_p_summary CHAR(1024),
    fld_p_media CHAR(1024),
    fld_p_physicalDescription CHAR(1024),
    fld_p_weight CHAR(1024),
    fld_p_height CHAR(1024),
    fld_p_thickness CHAR(1024),
    fld_p_length CHAR(1024),
    fld_p_dimensions CHAR(1024),
    fld_p_pageCount CHAR(1024),
    fld_p_lccn CHAR(1024),
    fld_p_acquired CHAR(1024),
    fld_p_dateStarted CHAR(1024),
    fld_p_dateRead CHAR(1024),
    fld_p_barcode CHAR(1024),
    fld_p_bcid CHAR(1024),
    fld_p_tags CHAR(1024),
    fld_p_collections CHAR(1024),
    fld_p_languages CHAR(1024),
    fld_p_originalLanguages CHAR(1024),
    fld_p_lcClassification CHAR(1024),
    fld_p_isbn CHAR(1024),
    fld_p_isbns CHAR(1024),
    fld_p_subjects CHAR(2048),
    fld_p_deweyDecimal CHAR(1024),
    fld_p_deweyWording CHAR(1024),
    fld_p_otherCallNumber CHAR(1024),
    fld_p_copies CHAR(1024),
    fld_p_source CHAR(1024),
    fld_p_entryDate CHAR(1024),
    fld_p_fromWhere CHAR(1024),
    fld_p_oclc CHAR(1024),
    fld_p_wordID CHAR(1024),
    fld_p_lendingPatron CHAR(1024),
    fld_p_lendingStatus CHAR(1024),
    fld_p_lendingStart CHAR(1024),
    fld_p_lendingEnd CHAR(1024),
    fld_p_listPrice CHAR(1024),
    fld_p_purchasePrice CHAR(1024),
    fld_p_value CHAR(1024),
    fld_p_condition CHAR(1024)
);

CREATE TABLE tbl_items
(
    fld_i_id_pk INTEGER,
    fld_i_isbn CHAR(255),
	fld_i_title CHAR(255),
	fld_i_author CHAR(255),
	fld_i_media CHAR(255),
	fld_i_pages CHAR(255),
	fld_i_languages CHAR(255),
	fld_i_year CHAR(255),
	fld_i_copies CHAR(255),
	fld_i_status CHAR(255),

	CONSTRAINT items_pk PRIMARY KEY(fld_i_id_pk),
	CONSTRAINT id_not_null CHECK(fld_i_id_pk IS NOT NULL),
	CONSTRAINT title_not_null CHECK(fld_i_title IS NOT NULL),
	CONSTRAINT media_not_null CHECK(fld_i_media IS NOT NULL),
	CONSTRAINT copies_not_null CHECK(fld_i_copies IS NOT NULL)
);

CREATE TABLE tbl_users
(
    fld_u_id_pk INTEGER,
    fld_u_name CHAR(255),
	fld_u_role CHAR(255),
    fld_u_username VARCHAR(255),
	fld_u_password VARCHAR(255),
	fld_u_status CHAR(255),
	fld_u_gradeLvl CHAR(255),
	fld_u_reservedItems INTEGER[], --Array of integers to store the item ids. Frontend will move the reserved to checked
	fld_u_checkedItems INTEGER[], --Array of integers to store the item ids. Frontend will move the checked to history
	fld_u_borrowHistory INTEGER[], --Another array of integers to store item ids. Data here should be stagnant.
	fld_u_reviews INTEGER[], --Array to store the review IDs. Should be joined to review table.

	--NOTE OF CAUTION: PSQL DOES NOT ENFORCE ARRAY DIMENSIONS, BE CAREFUL NOT TO ADD DIMENSIONS

	CONSTRAINT users_pk PRIMARY KEY(fld_u_id_pk),
	CONSTRAINT name_not_null CHECK(fld_u_name IS NOT NULL),
	CONSTRAINT role_not_null CHECK(fld_u_role IS NOT NULL),
    CONSTRAINT username_not_null CHECK(fld_u_username IS NOT NULL),
	CONSTRAINT password_not_null CHECK(fld_u_password IS NOT NULL),
	CONSTRAINT status_not_null CHECK(fld_u_status IS NOT NULL)
);

CREATE TABLE tbl_transactions
(
    fld_t_id_pk INTEGER,
	fld_t_userId_fk INTEGER,
	fld_t_itemId_fk INTEGER,
    fld_t_checkoutDate DATE,
	fld_t_dueDate DATE,
	fld_t_returnDate DATE,

	CONSTRAINT transactions_pk PRIMARY KEY(fld_t_id_pk),
	CONSTRAINT userID_not_null CHECK(fld_t_userId_fk IS NOT NULL),
	CONSTRAINT itemID_not_null CHECK(fld_t_itemId_fk IS NOT NULL),
	CONSTRAINT checkoutDate_not_null CHECK(fld_t_checkoutDate IS NOT NULL),
	CONSTRAINT dueDate_not_null CHECK(fld_t_dueDate IS NOT NULL),
	CONSTRAINT returnDate_not_null CHECK(fld_t_returnDate IS NOT NULL),
	CONSTRAINT userId_fk FOREIGN KEY(fld_t_userId_fk)
	    REFERENCES tbl_users(fld_u_id_pk),
	CONSTRAINT itemId_fk FOREIGN KEY(fld_t_itemId_fk)
	    REFERENCES tbl_items(fld_i_id_pk)
);

CREATE TABLE tbl_reservations
(

	fld_r_id_pk INTEGER,
	fld_r_userId_fk INTEGER,
	fld_r_itemId_fk INTEGER,
    fld_r_reservationDate DATE,
	fld_r_status CHAR(255),

	CONSTRAINT reservation_pk PRIMARY KEY(fld_r_id_pk),
	CONSTRAINT userID_not_null CHECK(fld_r_userId_fk IS NOT NULL),
	CONSTRAINT itemID_not_null CHECK(fld_r_itemId_fk IS NOT NULL),
	CONSTRAINT reservationDate_not_null CHECK(fld_r_reservationDate IS NOT NULL),
	CONSTRAINT userId_fk FOREIGN KEY(fld_r_userId_fk)
	    REFERENCES tbl_users(fld_u_id_pk),
	CONSTRAINT itemId_fk FOREIGN KEY(fld_r_itemId_fk)
	    REFERENCES tbl_items(fld_i_id_pk)

);

CREATE TABLE tbl_review
(

	--Fields in the review table have a V as their signifier.
	--This is to avoid overlap with the reservation table, which uses R.
	--Keep it in mind when calling review fields in the review table.

	fld_v_id_pk INTEGER,
	fld_v_userId_fk INTEGER,
	fld_v_itemId_fk INTEGER,
	fld_v_rating INTEGER,
	fld_v_review CHAR(255),
    fld_v_reviewDate DATE,

	CONSTRAINT review_pk PRIMARY KEY(fld_v_id_pk),
	CONSTRAINT userID_not_null CHECK(fld_v_userId_fk IS NOT NULL),
	CONSTRAINT itemID_not_null CHECK(fld_v_itemId_fk IS NOT NULL),
	CONSTRAINT rating_not_null CHECK(fld_v_rating IS NOT NULL),
	CONSTRAINT reviewDate_not_null CHECK(fld_v_reviewDate IS NOT NULL),
	CONSTRAINT review_not_null CHECK(fld_v_review IS NOT NULL),
	CONSTRAINT userId_fk FOREIGN KEY(fld_v_userId_fk)
	    REFERENCES tbl_users(fld_u_id_pk),
	CONSTRAINT itemId_fk FOREIGN KEY(fld_v_itemId_fk)
	    REFERENCES tbl_items(fld_i_id_pk)

);