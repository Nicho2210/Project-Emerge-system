{
  description = "Project Emerge System - Multi-language development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        
        # Python environment with all required packages
        pythonEnv = pkgs.python313.withPackages (ps: with ps; [
          numpy
          opencv4
          paho-mqtt
          matplotlib
          ruff
          # For GUI applications that might need Qt
          pyqt6
        ]);

        # System libraries needed for OpenCV and GUI applications
        systemLibs = with pkgs; [
          # OpenGL libraries - critical for OpenCV and Qt applications
          libGL
          libGLU
          # Mesa drivers for software rendering fallback
          mesa
          mesa.drivers
          # X11 libraries for GUI applications
          xorg.libX11
          xorg.libXext
          xorg.libXrender
          xorg.libXrandr
          xorg.libXi
          xorg.libXcursor
          xorg.libXinerama
          # Additional libraries for multimedia
          glib
          gst_all_1.gstreamer
          gst_all_1.gst-plugins-base
          gst_all_1.gst-plugins-good
          gst_all_1.gst-plugins-bad
          gst_all_1.gst-plugins-ugly
          # Font libraries
          fontconfig
          freetype
          # Wayland support (for modern desktop environments)
          wayland
          # Additional system libraries
          zlib
          stdenv.cc.cc.lib
          glibc
        ];

      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            # Python environment
            pythonEnv
            
            # Node.js for the dashboard (includes npm)
            pkgs.nodejs_20
            
            # Scala and SBT for the aggregate-runtime
            pkgs.scala_3
            pkgs.sbt
            pkgs.openjdk24
            
            # Development tools
            pkgs.git
            pkgs.docker
            pkgs.docker-compose
            
            # System libraries
          ] ++ systemLibs;

          # Environment variables to fix libGL and Qt issues
          shellHook = ''
            # Set up library path for OpenGL
            export LD_LIBRARY_PATH="${pkgs.libGL}/lib:${pkgs.libGLU}/lib:${pkgs.mesa}/lib:${pkgs.mesa.drivers}/lib:${pkgs.glib.out}/lib:$LD_LIBRARY_PATH"

            # Set up library path for X11
            export LD_LIBRARY_PATH="${pkgs.xorg.libX11}/lib:${pkgs.xorg.libXext}/lib:${pkgs.xorg.libXrender}/lib:$LD_LIBRARY_PATH"
            
            # Qt/PyQt6 specific environment variables
            export QT_PLUGIN_PATH="${pythonEnv}/${pythonEnv.sitePackages}/PyQt6/Qt6/plugins"
            export QML2_IMPORT_PATH="${pythonEnv}/${pythonEnv.sitePackages}/PyQt6/Qt6/qml"
            
            # Mesa/OpenGL configuration
            export MESA_GL_VERSION_OVERRIDE=3.3
            export MESA_GLSL_VERSION_OVERRIDE=330
            
            # Ensure proper font rendering
            export FONTCONFIG_PATH="${pkgs.fontconfig.out}/etc/fonts"
            
            # Python path for the project
            export PYTHONPATH="$PWD/aruco-detector:$PYTHONPATH"
            
            # Java environment for Scala
            export JAVA_HOME="${pkgs.openjdk17}/lib/openjdk"
            
            echo "🚀 Project Emerge development environment loaded!"
            echo "📍 Python: $(python --version)"
            echo "📍 Node.js: $(node --version)"
            echo "📍 Scala: $(scala -version 2>&1 | head -1)"
            echo "📍 Java: $(java -version 2>&1 | head -1)"
            echo ""
            echo "🔧 Available commands:"
            echo "  • Python ArUco detector: uv run python aruco-detector/main.py"
            echo "  • Dashboard: cd dashboard && npm run dev"
            echo "  • Scala build: sbt compile"
            echo "  • Docker compose: docker-compose up"
            echo ""
            echo "⚡ Libraries loaded for OpenCV/Qt GUI support"
            
            # Test OpenCV import to verify everything works
            python -c "import cv2; print('✅ OpenCV imported successfully!'); print(f'Version: {cv2.__version__}')" 2>/dev/null || echo "⚠️  OpenCV import test failed - check dependencies"
          '';

          # Additional environment variables for the shell
          NIX_SHELL_PRESERVE_PROMPT = 1;
        };
      });
}
