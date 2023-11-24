<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">

    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto|Varela+Round">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">

    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js"></script>

    <title>Admin Home</title>

    <!-- Custom fonts for this template-->
    <link href="vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
    <link
        href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i"
        rel="stylesheet">

    <!-- Custom styles for this template-->
    <link href="style/sb-admin-2.css" rel="stylesheet">

</head>

<body id="page-top">

    <!-- Page Wrapper -->
    <div id="wrapper">

        <!-- Content Wrapper -->
        <div id="content-wrapper" class="d-flex flex-column">

            <!-- Main Content -->
            <div id="content">

                <!-- Topbar -->
                <nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">

                    <!-- Topbar Navbar -->
                    <ul class="navbar-nav ml-auto">

                        <!-- Nav Item - User Information -->
                        <li class="nav-item dropdown no-arrow">
                            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span class="mr-2 d-none d-lg-inline text-gray-600 small">Douglas McGee</span>
                                <img class="img-profile rounded-circle" src="img/undraw_profile.svg">
                            </a>
                            <!-- Dropdown - User Information -->
                            <div class="dropdown-menu dropdown-menu-right shadow animated--grow-in"
                                aria-labelledby="userDropdown">
                                <a class="dropdown-item" href="#">
                                    <i class="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                                    Profile
                                </a>
                                <a class="dropdown-item" href="#">
                                    <i class="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>
                                    Settings
                                </a>
                                <a class="dropdown-item" href="#">
                                    <i class="fas fa-list fa-sm fa-fw mr-2 text-gray-400"></i>
                                    Activity Log
                                </a>
                                <div class="dropdown-divider"></div>
                                <a class="dropdown-item" href="#" data-toggle="modal" data-target="#logoutModal">
                                    <i class="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                                    Logout
                                </a>
                            </div>
                        </li>

                    </ul>

                </nav>
                <!-- End of Topbar -->

                <!-- Begin Page Content -->
                <div class="container-fluid">

                    <!-- Page Heading -->
                    <!-- <h1 class="h3 mb-4 text-gray-800">Blank Page</h1> -->
                </div>
                <!-- /.container-fluid -->
                <div class="container-xl">
                    <form class="form-inline">
                        <div class="input-group">
                            <input type="text" class="form-control" placeholder="Search for..." aria-label="Search"
                                aria-describedby="basic-addon2">
                            <div class="input-group-append">
                                <button class="btn btn-primary" type="button">
                                    <i class="fas fa-search fa-sm"></i>
                                </button>
                            </div>
                        </div>
                    </form>
                    <div class="table-responsive">
                        <div class="table-wrapper">
                            <div class="table-title">
                                <div class="row">
                                    <div class="col-sm-5">
                                        <h2><b>User Management</b></h2>
                                    </div>
                                    <div class="col-sm-7">
                                        <a href="#" class="btn btn-secondary"><i class="material-icons">&#xE147;</i>
                                            <span>Add New User</span></a>
                                        <a href="#" class="btn btn-secondary"><i class="material-icons">&#xE24D;</i>
                                            <span>Set Schedule</span></a>
                                    </div>
                                </div>
                            </div>
                            <table class="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Username</th>
                                        <th>Schedule</th>
                                        <th>Session</th>
                                        <th>Ban Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td><a href="#"><img src="style/media/avatar.png" class="avatar"
                                                    alt="Avatar"> Michael Holz</a></td>
                                        <td>amiqt123</td>
                                        <td>Monday</td>
                                        <td>0</td>
                                        <td><span class="status text-success">&bull;</span> Active</td>
                                        <td>
                                            <a href="#" class="reset" title="Reset" data-toggle="tooltip"><i
                                                    class="material-icons">&#xF053;</i></a>
                                            <a href="#" class="delete" title="Delete" data-toggle="tooltip"><i
                                                    class="material-icons">&#xE872;</i></a>
                                            <a href="#" class="ban" title="Ban" data-toggle="tooltip"><i
                                                    class="material-icons">&#xE14B;</i></a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td><a href="#"><img src="style/media/avatar.png" class="avatar"
                                                    alt="Avatar"> Paula Wilson</a></td>
                                        <td>amiqt123</td>
                                        <td>Tuesday</td>
                                        <td>0</td>
                                        <td><span class="status text-success">&bull;</span> Active</td>
                                        <td>
                                            <a href="#" class="reset" title="Reset" data-toggle="tooltip"><i
                                                    class="material-icons">&#xF053;</i></a>
                                            <a href="#" class="delete" title="Delete" data-toggle="tooltip"><i
                                                    class="material-icons">&#xE872;</i></a>
                                            <a href="#" class="ban" title="Ban" data-toggle="tooltip"><i
                                                    class="material-icons">&#xE14B;</i></a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>3</td>
                                        <td><a href="#"><img src="style/media/avatar.png" class="avatar"
                                                    alt="Avatar"> Antonio Moreno</a></td>
                                        <td>amiqt123</td>
                                        <td>Wednesday</td>
                                        <td>0</td>
                                        <td><span class="status text-danger">&bull;</span> Suspended</td>
                                        <td>
                                            <a href="#" class="reset" title="Reset" data-toggle="tooltip"><i
                                                    class="material-icons">&#xF053;</i></a>
                                            <a href="#" class="delete" title="Delete" data-toggle="tooltip"><i
                                                    class="material-icons">&#xE872;</i></a>
                                            <a href="#" class="ban" title="Ban" data-toggle="tooltip"><i
                                                    class="material-icons">&#xE14B;</i></a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>4</td>
                                        <td><a href="#"><img src="style/media/avatar.png" class="avatar"
                                                    alt="Avatar"> Mary Saveley</a></td>
                                        <td>amiqt123</td>
                                        <td>Thursday</td>
                                        <td>0</td>
                                        <td><span class="status text-success">&bull;</span> Active</td>
                                        <td>
                                            <a href="#" class="reset" title="Reset" data-toggle="tooltip"><i
                                                    class="material-icons">&#xF053;</i></a>
                                            <a href="#" class="delete" title="Delete" data-toggle="tooltip"><i
                                                    class="material-icons">&#xE872;</i></a>
                                            <a href="#" class="ban" title="Ban" data-toggle="tooltip"><i
                                                    class="material-icons">&#xE14B;</i></a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>5</td>
                                        <td><a href="#"><img src="style/media/avatar.png" class="avatar"
                                                    alt="Avatar"> Martin Sommer</a></td>
                                        <td>amiqt123</td>
                                        <td>Friday</td>
                                        <td>0</td>
                                        <td><span class="status text-danger">&bull;</span> Suspended</td>
                                        <td>
                                            <a href="#" class="reset" title="Reset" data-toggle="tooltip"><i
                                                    class="material-icons">&#xF053;</i></a>
                                            <a href="#" class="delete" title="Delete" data-toggle="tooltip"><i
                                                    class="material-icons">&#xE872;</i></a>
                                            <a href="#" class="ban" title="Ban" data-toggle="tooltip"><i
                                                    class="material-icons">&#xE14B;</i></a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <script>
                                $(document).ready(function () {
                                    $('[data-toggle="tooltip"]').tooltip();
                                });
                            </script>
                        </div>
                    </div>

                </div>
                <!-- End of Main Content -->

                <!-- Footer -->
                <!-- <footer class="sticky-footer bg-white">
                    <div class="container my-auto">
                        <div class="copyright text-center my-auto">
                            <span>Copyright &copy; Your Website 2020</span>
                        </div>
                    </div>
                </footer> -->
                <?php
                    include('./../../res/footer.html')
                ?>
                <!-- End of Footer -->

            </div>
            <!-- End of Content Wrapper -->

        </div>
        <!-- End of Page Wrapper -->

        <!-- Scroll to Top Button-->
        <a class="scroll-to-top rounded" href="#page-top">
            <i class="fas fa-angle-up"></i>
        </a>

        <!-- Logout Modal-->
        <div class="modal fade" id="logoutModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
            aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Ready to Leave?</h5>
                        <button class="close" type="button" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                    <div class="modal-body">Select "Logout" below if you are ready to end your current session.</div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
                        <a class="btn btn-primary" href="login.html">Logout</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bootstrap core JavaScript-->
        <script src="vendor/jquery/jquery.min.js"></script>
        <script src="vendor/bootstrap/js/bootstrap.bundle.min.js"></script>

        <!-- Core plugin JavaScript-->
        <script src="vendor/jquery-easing/jquery.easing.min.js"></script>

        <!-- Custom scripts for all pages-->
        <script src="js/sb-admin-2.min.js"></script>

</body>

</html>