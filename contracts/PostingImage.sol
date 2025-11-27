// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PostingImage {

    mapping(address => string) public usernames;

    struct Comment {
        address author;
        string text;
        uint256 timestamp;
    }

    struct Post {
        uint256 id;
        address author;
        string imageUrl;
        string description;
        uint256 likes;
        uint256 timestamp;
        Comment[] comments;
    }

    uint256 public totalPosts = 0;
    mapping(uint256 => Post) public posts;
    mapping(uint256 => mapping(address => bool)) public hasLiked;

    event UsernameUpdated(address indexed user, string username);

    event PostCreated(
        uint256 id,
        address indexed author,
        string imageUrl,
        string description,
        uint256 timestamp
    );

    event PostLiked(uint256 id, address indexed liker, uint256 newLikes);

    event CommentAdded(
        uint256 indexed id,
        address indexed commenter,
        string text,
        uint256 timestamp
    );

    // =====================================================
    // USERNAME
    // =====================================================
    function setUsername(string memory name) public {
        usernames[msg.sender] = name;
        emit UsernameUpdated(msg.sender, name);
    }

    // =====================================================
    // CREATE POST
    // =====================================================
    function createPost(string memory img, string memory desc) public {
        Post storage p = posts[totalPosts];
        p.id = totalPosts;
        p.author = msg.sender;
        p.imageUrl = img;
        p.description = desc;
        p.timestamp = block.timestamp;

        emit PostCreated(totalPosts, msg.sender, img, desc, block.timestamp);
        totalPosts++;
    }

    // =====================================================
    // LIKE
    // =====================================================
    function likePost(uint256 postId) public {
        require(postId < totalPosts, "Post not found");
        require(!hasLiked[postId][msg.sender], "Anda sudah like postingan ini");

        posts[postId].likes++;

        // Penting → tandai bahwa user sudah like
        hasLiked[postId][msg.sender] = true;

        emit PostLiked(postId, msg.sender, posts[postId].likes);
    }

    // =====================================================
    // COMMENT
    // =====================================================
    function addComment(uint256 postId, string memory text) public {
        require(postId < totalPosts, "Post not found");

        posts[postId].comments.push(
            Comment(msg.sender, text, block.timestamp)
        );

        emit CommentAdded(postId, msg.sender, text, block.timestamp);
    }

    function getCommentCount(uint256 postId) public view returns (uint256) {
        return posts[postId].comments.length;
    }

    function getComment(uint256 postId, uint256 index)
        public
        view
        returns (address, string memory, uint256)
    {
        Comment storage c = posts[postId].comments[index];
        return (c.author, c.text, c.timestamp);
    }

    // =====================================================
    // GET POST
    // =====================================================
    function getPost(uint256 id)
        public
        view
        returns (
            uint256,
            address,
            string memory,
            string memory,
            uint256,
            uint256,
            uint256
        )
    {
        Post storage p = posts[id];
        return (
            p.id,
            p.author,
            p.imageUrl,
            p.description,
            p.likes,
            p.timestamp,
            p.comments.length
        );
    }
}
